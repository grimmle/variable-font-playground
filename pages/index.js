/* eslint-disable react-hooks/exhaustive-deps */
import * as React from 'react';
import { useState, useEffect } from 'react';
import opentype from 'opentype.js';
import fs from 'fs';

import Label from '../components/label';
import Credits from '../components/credits';
import { Button, Slider, Box, Select, MenuItem } from '@mui/material';
import { updateGradient,  buildFont } from '../lib/helpers';
import { dropHandler, dragOverHandler, dragLeaveHandler } from '../lib/dropzone';
import { readFonts } from '../lib/database';


export default function App({ localFonts }) {
  const [reload, setReload] = useState(false)
  const [fonts, setFonts] = useState(localFonts)
  const [font, setFont] = useState(fonts[0])
  const [fontAxes, setFontAxes] = useState({});
  const [fontInstance, setFontInstance] = useState(font.instances[0] || '');
  const [variation, setVariation] = useState('')
  const [transform, setTransform] = useState({
    size: 50,
    letterSpace: 1,
    lineHeight: 1.0,
    transform: '',
    align: 'left',
  })

  const loadFonts = async () => {
    loadLocalFonts()
    loadFontsFromDatabase()
  }

  const loadLocalFonts = () => {
    fonts.map((font) => {
      const fontFace = new FontFace(font.name, 'url(fonts/' + font.name + '.ttf)')
      document.fonts.add(fontFace)
    })
  }
  const loadFontsFromDatabase = async () => {
    const dbFonts = await readFonts()
    if (!dbFonts) return 
    const loadedFonts = dbFonts.map(f => {
      const font = opentype.parse(f.buffer);
      const fontName = font.tables.name.fontFamily?.en
      const fontFace = new FontFace(fontName, f.buffer)
      document.fonts.add(fontFace)
      return buildFont(font, fontName)
    })
    setFonts([ ...localFonts, ...loadedFonts ])
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
    if (!font.axes) return 
    const ax = Object.assign({}, ...font.axes.map((axis) => {return {[axis.tag]: axis.defaultValue}}))
    setFontAxes(ax)
    setFontInstance(font.instances[0] || '')
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
    else if (fontAxes[axis] !== undefined) setFontAxes({...fontAxes, [axis]: e.target.value})
    else setTransform({...transform, [axis]: e.target.value})
  }
  
  const style = {
    'fontFamily': font.name,
    'fontVariationSettings': variation,
    'textTransform': transform.transform, 
    'fontSize': transform.size, 
    'textAlign': transform.align, 
    'letterSpacing': transform.letterSpace,
    'lineHeight': transform.lineHeight,
  }

  return (
    <div 
      onDrop={async (e)=> { 
        dropHandler(e)
          .then((res) => { 
            if(res === true) setReload(true) 
          })
        }} 
      onDragOver={dragOverHandler} 
      onDragLeave={dragLeaveHandler} 
      style={{width: '100%', height: '100%' }}
      >
      <div id='dropzone'/>
        <div id="header">
          <h1>
            Variable Font Playground
          </h1>
          <div></div>
        </div>
        <div className="container">
          <div className="sidebar">
          <div style={{background: 'linear-gradient(-45deg, rgb(74, 65, 231) 0%, rgb(233, 33, 109) 100%)', boxShadow: '0px 2px 6px rgba(0,0,0,0.3)', padding: '10px', borderRadius: '25px'}}>
            <Box sx={{ position: 'relative', background: 'linear-gradient(-45deg, rgb(233, 33, 109) 0%, rgb(74, 65, 231) 100%)', padding: '20px 20px', borderRadius: '20px'}}>
              <h3>Font</h3>
              {/* <p className="info">
                play with these free to use fonts or drag &apos;n drop your own
              </p> */}
              <div className='select-container'>
                <Select value={font} onChange={e => {handleChange('font', e)}} color="primary" variant="standard" sx={{marginLeft: '10px'}}>
                  {fonts.map((font, id) => <MenuItem key={id} value={font}>{font.name}</MenuItem>)}
                </Select>
              </div>
              <h3>Preset</h3>
              <div className='select-container'>
                <Select value={fontInstance} onChange={e => {handleChange('instance', e)}} color="primary" variant="standard" sx={{marginLeft: '10px'}}>
                  {font.instances
                    ? (font.instances.map((instance, id) => {
                      if(!instance.name?.en) return
                      return <MenuItem key={id} value={instance}>{instance.name.en}</MenuItem>}))
                    : <MenuItem disabled value="">None</MenuItem>}
                </Select>
              </div>
              <Credits font={font}/>
            </Box>
          </div>

          <div style={{background: 'linear-gradient(-45deg, rgb(74, 65, 231) 0%, rgb(233, 33, 109) 100%)', boxShadow: '0px 2px 6px rgba(0,0,0,0.3)', margin: '20px 0 0 0', padding: '10px', borderRadius: '25px'}}>
            <Box sx={{ position: 'relative', background: 'linear-gradient(-45deg, rgb(233, 33, 109) 0%, rgb(74, 65, 231) 100%)', padding: '20px 20px 50px', borderRadius: '20px'}}>
              <div className="conic-gradient top" />
              <div className="conic-gradient bottom" />

              <h3>Transform</h3>
              <div className='button-container'>
                <Button variant="outlined" size="small" color="primary" value="uppercase" onClick={e => {handleChange('transform', e)}}>Uppercase</Button>
              </div>
              <div className='button-container'>
                <Button variant="outlined" size="small" color="primary" value="lowercase" onClick={e => {handleChange('transform', e)}}>Lowercase</Button>
              </div>
              <div className='button-container'>
                <Button variant="outlined" size="small" color="primary" value="capitalize" onClick={e => {handleChange('transform', e)}}>Capitalize</Button>
              </div>
              <div className='button-container'>
                <Button variant="outlined" size="small" color="primary" value="" onClick={e => {handleChange('transform', e)}}>None</Button>
              </div>

              <h3>Align</h3>
              <div className='button-container'>
                <Button variant="outlined" size="small" color="primary" value="left" onClick={e => {handleChange('align', e)}}>Left</Button>
              </div>
              <div className='button-container'>
                <Button variant="outlined" size="small" color="primary" value="center" onClick={e => {handleChange('align', e)}}>Center</Button>
              </div>
              <div className='button-container'>
                <Button variant="outlined" size="small" color="primary" value="right" onClick={e => {handleChange('align', e)}}>Right</Button>
              </div>
            </Box>
          </div>

          <div style={{background: 'linear-gradient(-220deg,white 0%,lightgray 20%,white 60%,gray 100%)', boxShadow: '0px 2px 6px rgba(0,0,0,0.3)', margin: '20px 0 0 0', padding: '10px', borderRadius: '25px'}}>
            <Box sx={{padding: '10px', background: 'linear-gradient(-40deg,white 0%,lightgray 20%,white 60%,gray 100%)', padding: '15px', borderRadius: '20px'}}>
              <h3>Vary</h3>
              <Label>Size {transform.size}</Label>
              <Slider size="small" value={transform.size} min={10} max={300} sx={{'& .MuiSlider-track': { background: updateGradient(10, 300, transform.size)}}} valueLabelDisplay="off" color="primary" onChange={(e) => handleChange('size', e)} aria-label="Size"></Slider>
              <Label>Letter Spacing {transform.letterSpace}</Label>
              <Slider size="small" value={transform.letterSpace} min={0} max={50} sx={{'& .MuiSlider-track': { background: updateGradient(0, 50, transform.letterSpace)}}} valueLabelDisplay="off" color="primary" onChange={(e) => handleChange('letterSpace', e)} aria-label="Letter Spacing">Letter Spacing</Slider>
              <Label>Line Height {transform.lineHeight}</Label>
              <Slider size="small" value={transform.lineHeight} min={0} max={3} step={0.1} sx={{'& .MuiSlider-track': { background: updateGradient(0, 3, transform.lineHeight)}}} valueLabelDisplay="off" color="primary" onChange={(e) => handleChange('lineHeight', e)} aria-label="Line Height">lineHeight</Slider>
              {font.axes?.map((axis) => {
                const key = [axis.tag]
                return (
                  <div key={axis.tag}>
                    <Label>{axis.name.en} {Math.round(fontAxes[key] * 10) / 10}</Label>
                    <Slider size="small" value={fontAxes[key] || 0} defaultValue={axis.defaultValue} min={axis.minValue} max={axis.maxValue} sx={{'& .MuiSlider-track': { background: updateGradient(axis.minValue, axis.maxValue, fontAxes[key])}}} valueLabelDisplay="off" onChange={(e) => handleChange(axis.tag, e)} aria-label={axis.name.en}></Slider>
                  </div>
                )
              })}
            </Box>
          </div>
        </div>

        <textarea id='variable-text-area' style={style} defaultValue='The quick brown fox jumps over the lazy dog'></textarea>
        <p style={{ position: 'absolute', bottom: '0px', right: '0px', padding: '2px', backgroundColor: 'lightgray'}}>my github: <a target="_blank" rel="noreferrer" href="https://github.com/grimmle">grimmle</a> </p>
      </div>
    </div>
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
