import * as React from 'react';
import { Button, Slider, Container, Box, Select, MenuItem } from '@mui/material';
import { useState, useEffect } from 'react';
import opentype from 'opentype.js'
import fs from 'fs';


export default function App({ fonts }) {
  const [font, setFont] = useState(fonts[0])
  const [fontAxes, setFontAxes] = useState(Object.assign({}, ...font.axes.map((axis) => {return {[axis.tag]: axis.defaultValue}})));
  const [variation, setVariation] = useState('')
  const [transform, setTransform] = useState({
    size: 50,
    letterSpace: 1,
    lineHeight: 50,
    transform: '',
    align: 'left',
  })

  useEffect(() => {
    const ax = Object.assign({}, ...font.axes.map((axis) => {return {[axis.tag]: axis.defaultValue}}))
    setFontAxes(ax)
  }, [font])

  useEffect(() => {
    const v = Object.keys(fontAxes).map((ax) => {
      return `'${ax}' ${fontAxes[ax]}`
    }).join(', ')
    setVariation(v)
  }, [fontAxes])

  const handleChange = (axis, e) => {
    if (axis === 'font') setFont(e.target.value);
    else if (fontAxes[axis] !== undefined) setFontAxes({...fontAxes, [axis]: e.target.value})
    else setTransform({...transform, [axis]: e.target.value})
  }
  
  const style = {
    // 'fontFace': {},
    'fontFamily': font.name,
    'fontVariationSettings': variation,
    'textTransform': transform.transform, 
    'fontSize': transform.size, 
    'textAlign': transform.align, 
    'letterSpacing': transform.letterSpace,
    'lineHeight': transform.lineHeight + 'px', 
  }

  return (
    <>
      <Container>
        {/* <h1>Font Playground</h1> */}
        <textarea id='variable-text-area' style={style} defaultValue='abcdefghijklmnopqrstuvwxyz'></textarea>

        <h3>Font</h3>
        <Select value={font} onChange={e => {handleChange('font', e)}} color="primary" variant="outlined" sx={{marginLeft: '10px'}}>
          {fonts.map((font, id) => <MenuItem key={id} value={font}>{font.name}</MenuItem>)}
        </Select>

        <h3>Transform</h3>
        <Box>
          <Button variant="outlined" size="small" color="primary" style={{margin: '0 10px'}} value="uppercase" onClick={e => {handleChange('transform', e)}}>Uppercase</Button>
          <Button variant="outlined" size="small" color="primary" style={{margin: '0 10px'}} value="capitalize" onClick={e => {handleChange('transform', e)}}>Capitalize</Button>
          <Button variant="outlined" size="small" color="primary" style={{margin: '0 10px'}} value="lowercase" onClick={e => {handleChange('transform', e)}}>Lowercase</Button>
          <Button variant="outlined" size="small" color="primary" style={{margin: '0 10px'}} value="" onClick={e => {handleChange('transform', e)}}>None</Button>
        </Box>

        <h3>Align</h3>
        <Box>
          <Button variant="outlined" size="small" color="primary" style={{margin: '0 10px'}} value="left" onClick={e => {handleChange('align', e)}}>Left</Button>
          <Button variant="outlined" size="small" color="primary" style={{margin: '0 10px'}} value="center" onClick={e => {handleChange('align', e)}}>Center</Button>
          <Button variant="outlined" size="small" color="primary" style={{margin: '0 10px'}} value="right" onClick={e => {handleChange('align', e)}}>Right</Button>
        </Box>

        <h3>Vary</h3>
        <Box sx={{padding: '10px'}}>
          <p>Size</p>
          <Slider size="small" value={transform.size} min={10} max={100} valueLabelDisplay="auto" color="primary" onChange={(e) => handleChange('size', e)} aria-label="Size">Size</Slider>
          <p>Letter Spacing</p>
          <Slider size="small" value={transform.letterSpace} min={0} max={50} valueLabelDisplay="auto" color="primary" onChange={(e) => handleChange('letterSpace', e)} aria-label="Letter Spacing">Letter Spacing</Slider>
          <p>Line Height</p>
          <Slider size="small" value={transform.lineHeight} min={0} max={200} valueLabelDisplay="auto" color="primary" onChange={(e) => handleChange('lineHeight', e)} aria-label="Line Height">lineHeight</Slider>
          {font.axes.map((axis) => {
            const key = [axis.tag]
            return (
              <div key={axis.tag}>
                <p>{axis.name.en}</p>
                <Slider size="small" value={fontAxes[key] || 0} defaultValue={axis.defaultValue} min={axis.minValue} max={axis.maxValue} valueLabelDisplay="auto" onChange={(e) => handleChange(axis.tag, e)} aria-label={axis.name.en}></Slider>
              </div>
            )
          })}
        </Box>
      </Container>
    </>
  );
}

export async function getStaticProps(context) {
  const files = fs.readdirSync("public/fonts").filter(file => !file.startsWith('.')).map(file => file.replace('.ttf', ''))
  const axes = files.map(file => {
    const font = opentype.loadSync('public/fonts/' + file + '.ttf');
    const axes = font.tables.fvar.axes
    return axes;
  });
  const fonts = files.map((f, index) => {
    return {
      name: f,
      axes: axes[index]
    }
  })
  return {
    props: {
      fonts,
    },
  }
}
