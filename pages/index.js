/* eslint-disable react-hooks/exhaustive-deps */
import { useState, useEffect } from 'react';
import opentype from 'opentype.js';
import fs from 'fs';

import { Button, Slider, Box, Select, MenuItem } from '@mui/material';
import { HexColorPicker, HexColorInput } from "react-colorful";

import Label from '../components/label';
import Credits from '../components/credits';
import { CircularText } from '../components/circular-text';

import { updateGradient, buildFont } from '../lib/helpers';
import { dropHandler, dragOverHandler, dragLeaveHandler } from '../lib/dropzone';
import { readFonts } from '../lib/database';


export default function App({ localFonts }) {
  const [loaded, setLoaded] = useState(false)
  const [reload, setReload] = useState(false)
  const [fonts, setFonts] = useState(localFonts)
  const [font, setFont] = useState(fonts[0])
  const [fontAxes, setFontAxes] = useState({});
  const [fontInstance, setFontInstance] = useState(font.instances?.[0] ?? '');
  const [variation, setVariation] = useState('')
  const [transform, setTransform] = useState({
    size: 50,
    letterSpace: 1,
    lineHeight: 1.0,
    transform: 'none',
    align: 'left',
  })
  const [color, setColor] = useState("#4a41e7");

  const loadFonts = async () => {
    loadLocalFonts()
    loadFontsFromDatabase()
  }

  const loadLocalFonts = () => {
    fonts.map((font) => {
      const fontFace = new FontFace(font.name, 'url(fonts/' + font.name + '.ttf)')
      if (!document.fonts.has(fontFace)) document.fonts.add(fontFace)
    })
  }
  const loadFontsFromDatabase = async () => {
    const dbFonts = await readFonts()
    if (!dbFonts) return
    const loadedFonts = dbFonts.map(f => {
      try {
        const font = opentype.parse(f.buffer);
        const fileName = f.file_name.split('.')[0]
        const familyName = font.tables.name.fontFamily?.en
        const fontName = familyName.length > 2 ? familyName : fileName
        const fontFace = new FontFace(fontName, f.buffer)
        if (!document.fonts.has(fontFace)) document.fonts.add(fontFace)
        return buildFont(font, fontName)
      } catch (error) {
        //setError(error)
        console.log(error)
      }
    }).filter((font) => font !== undefined)
    const newFontSet = [...localFonts, ...loadedFonts];
    document.fonts.onloadingdone = () => {
      setLoaded(true)
    }
    if (loadedFonts) {
      setFonts(newFontSet)
    }
  }

  useEffect(() => {
    loadFonts()
  }, [])

  useEffect(() => {
    if (!reload) return
    loadFonts()
  }, [reload])

  useEffect(() => {
    if (!reload) return
    setFont(fonts[fonts.length - 1])
    setReload(false)
  }, [fonts])

  useEffect(() => {
    setFontInstance(font.instances?.[0] ?? '')
    if (!font.axes) return
    const ax = Object.assign({}, ...font.axes.map((axis) => { return { [axis.tag]: axis.defaultValue } }))
    setFontAxes(ax)
  }, [font])

  useEffect(() => {
    const v = Object.keys(fontAxes).map((ax) => {
      return `'${ax}' ${fontAxes[ax]}`
    }).join(', ')
    setVariation(v)
  }, [fontAxes])

  useEffect(() => {
    if (!fontInstance) return
    const v = Object.keys(fontInstance.coordinates).map((ax) => {
      fontAxes[ax] = fontInstance.coordinates[ax]
      return `'${ax}' ${fontInstance.coordinates[ax]}`
    }).join(', ')
    setVariation(v)
  }, [fontInstance])

  const handleChange = (axis, e) => {
    if (axis === 'font') setFont(e.target.value);
    else if (axis === 'instance') setFontInstance(e.target.value);
    else if (fontAxes[axis] !== undefined) {
      setFontAxes({ ...fontAxes, [axis]: e.target.value })
      setFontInstance('')
    }
    else setTransform({ ...transform, [axis]: e.target.value })
  }

  const style = {
    'fontFamily': font.name,
    'fontVariationSettings': variation,
    'textTransform': transform.transform,
    'fontSize': transform.size,
    'textAlign': transform.align,
    'letterSpacing': transform.letterSpace,
    'lineHeight': transform.lineHeight,
    'color': color
  }

  return (
    <>
      <div id="drop-indicator">
        <CircularText side={0.85}>
          drop here&nbsp;drop here&nbsp;drop here&nbsp;drop here&nbsp;
        </CircularText>
      </div>

      <div
        onDrop={async (e) => {
          dropHandler(e)
            .then(async (res) => {
              if (res.status === 'success') {
                setReload(true)
              }
              else console.log(res.msg)
              dragLeaveHandler(e)
            })
        }}
        onDragOver={dragOverHandler}
        onDragLeave={dragLeaveHandler}
        style={{ width: '100%', height: '100%', overflowY: 'scroll' }}
      >
        <div id='dropzone' />
        <div id="header">
          <h1>
            Variable Font Playground
          </h1>
          <div id="line" />
        </div>
        <div className="container">
          <div className="sidebar">
            <div style={{ background: 'linear-gradient(-45deg, rgb(74, 65, 231) 0%, rgb(233, 33, 109) 100%)', boxShadow: '0px 2px 6px rgba(0,0,0,0.3)', padding: '10px', borderRadius: '25px' }}>
              <Box sx={{ position: 'relative', background: 'linear-gradient(-45deg, rgb(233, 33, 109) 0%, rgb(74, 65, 231) 100%)', padding: '20px 20px', borderRadius: '20px' }}>
                <h3>Font</h3>
                {/* <p className="info">
                  play with these free to use fonts or drag &apos;n drop your own
                </p> */}
                <div className='select-container' style={{ marginBottom: '15px' }}>
                  <Select value={font} onChange={e => { handleChange('font', e) }} color="primary" variant="standard" sx={{ marginLeft: '10px' }}>
                    {fonts.map((font, id) => <MenuItem key={id} value={font}>{font.name}</MenuItem>)}
                  </Select>
                </div>
                <h3>Preset</h3>
                <div className='select-container'>
                  <Select
                    disabled={!font.instances}
                    defaultValue=''
                    displayEmpty
                    renderValue={(selected) => {
                      if (!selected) return <span className="placeholder">None</span>
                      return selected.name?.en
                    }}
                    value={fontInstance}
                    onChange={e => { handleChange('instance', e) }}
                    color="primary"
                    variant="standard"
                    sx={{ marginLeft: '10px' }}>
                    {font.instances
                      && (font.instances.map((instance, id) => {
                        if (!instance.name?.en) return
                        return <MenuItem key={id} value={instance}>{instance.name.en}</MenuItem>
                      }))}
                  </Select>
                </div>
                <Credits font={font} />
                <br />
                <h3>Transform</h3>
                <div className="grid-container col2" style={{ marginBottom: '15px' }}>
                  <div className='button-container'>
                    <Button variant="outlined" size="small" color="primary" value="uppercase" onClick={e => { handleChange('transform', e) }}>uppercase</Button>
                  </div>
                  <div className='button-container'>
                    <Button variant="outlined" size="small" color="primary" value="lowercase" onClick={e => { handleChange('transform', e) }}>lowercase</Button>
                  </div>
                  <div className='button-container'>
                    <Button variant="outlined" size="small" color="primary" value="capitalize" onClick={e => { handleChange('transform', e) }}>capitalize</Button>
                  </div>
                  <div className='button-container'>
                    <Button variant="outlined" size="small" color="primary" value="" onClick={e => { handleChange('transform', e) }}>none</Button>
                  </div>
                </div>

                <h3>Align</h3>
                <div className="grid-container col3">
                  <div className='button-container'>
                    <Button variant="outlined" size="small" color="primary" value="left" onClick={e => { handleChange('align', e) }}>Left</Button>
                  </div>
                  <div className='button-container'>
                    <Button variant="outlined" size="small" color="primary" value="center" onClick={e => { handleChange('align', e) }}>Center</Button>
                  </div>
                  <div className='button-container'>
                    <Button variant="outlined" size="small" color="primary" value="right" onClick={e => { handleChange('align', e) }}>Right</Button>
                  </div>
                </div>
              </Box>
            </div>

            <div style={{ background: 'linear-gradient(-220deg,white 0%,lightgray 20%,white 60%,gray 100%)', boxShadow: '0px 2px 6px rgba(0,0,0,0.3)', margin: '20px 0 0 0', padding: '10px', borderRadius: '25px' }}>
              <Box sx={{ padding: '10px', background: 'linear-gradient(-40deg,white 0%,lightgray 20%,white 60%,gray 100%)', padding: '15px', borderRadius: '20px' }}>
                <h3>Vary</h3>
                <Label>Size {transform.size}</Label>
                <Slider size="small" value={transform.size} min={10} max={300} sx={{ '& .MuiSlider-track': { background: updateGradient(10, 300, transform.size) } }} valueLabelDisplay="off" color="primary" onChange={(e) => handleChange('size', e)} aria-label="Size"></Slider>
                <Label>Letter Spacing {transform.letterSpace}</Label>
                <Slider size="small" value={transform.letterSpace} min={0} max={50} sx={{ '& .MuiSlider-track': { background: updateGradient(0, 50, transform.letterSpace) } }} valueLabelDisplay="off" color="primary" onChange={(e) => handleChange('letterSpace', e)} aria-label="Letter Spacing">Letter Spacing</Slider>
                <Label>Line Height {transform.lineHeight}</Label>
                <Slider size="small" value={transform.lineHeight} min={0} max={3} step={0.1} sx={{ '& .MuiSlider-track': { background: updateGradient(0, 3, transform.lineHeight) } }} valueLabelDisplay="off" color="primary" onChange={(e) => handleChange('lineHeight', e)} aria-label="Line Height">lineHeight</Slider>
                {font.axes?.map((axis) => {
                  const key = [axis.tag]
                  return (
                    <div key={axis.tag}>
                      <Label>{axis.name.en} {Math.round(fontAxes[key] * 10) / 10}</Label>
                      <Slider size="small" value={fontAxes[key] || 0} defaultValue={axis.defaultValue} min={axis.minValue} max={axis.maxValue} sx={{ '& .MuiSlider-track': { background: updateGradient(axis.minValue, axis.maxValue, fontAxes[key]) } }} valueLabelDisplay="off" onChange={(e) => handleChange(axis.tag, e)} aria-label={axis.name.en}></Slider>
                    </div>
                  )
                })}
              </Box>
            </div>

            <div style={{ background: 'linear-gradient(-220deg,white 0%,lightgray 20%,white 60%,gray 100%)', boxShadow: '0px 2px 6px rgba(0,0,0,0.3)', margin: '20px 0 0 0', padding: '10px', borderRadius: '25px' }}>
              <Box sx={{ padding: '10px', background: 'linear-gradient(-40deg,white 0%,lightgray 20%,white 60%,gray 100%)', padding: '15px', borderRadius: '20px' }}>
                <h3>Color</h3>
                <Label>Hex <HexColorInput color={color} onChange={setColor} prefixed={true} style={{ border: 'none', outline: 'none', backgroundColor: 'transparent', fontSize: 'inherit', textTransform: 'uppercase', fontFamily: 'inherit', fontWeight: 'bold' }} /></Label>
                <HexColorPicker color={color} onChange={setColor} />
              </Box>
            </div>
          </div>

          <textarea id='variable-text-area' style={style} defaultValue={loaded ? 'The quick brown fox jumps over the lazy dog' : ''}></textarea>
          <p style={{ position: 'absolute', bottom: '0px', right: '0px', padding: '2px', backgroundColor: 'lightgray' }}>my github: <a target="_blank" rel="noreferrer" href="https://github.com/grimmle">grimmle</a> </p>
        </div>
      </div>
    </>
  );
}

export async function getStaticProps() {
  const files = fs.readdirSync("public/fonts").filter(file => !file.startsWith('.')).map(file => file.replace('.ttf', ''))
  const fonts = files.map(file => {
    const font = opentype.loadSync('public/fonts/' + file + '.ttf');
    return buildFont(font, file)
  })
  return {
    props: {
      localFonts: fonts,
    },
  }
}
