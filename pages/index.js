import * as React from 'react';
import { Button, Slider, Container, Box, Select, MenuItem } from '@mui/material';
import { useState, useEffect } from 'react';
import fs from 'fs';
import opentype from 'opentype.js'


export default function App({ fonts }) {
  const [font, setFont] = useState(fonts[0])
  const [wght, setWght] = useState(font.axes.find((a) => a.tag ==='wght')?.defaultValue || 500)
  const [wdth, setWdth] = useState(font.axes.find((a) => a.tag ==='wdth')?.defaultValue || 100)
  const [cnst, setCnst] = useState(font.axes.find((a) => a.tag ==='cnst')?.defaultValue || 50)
  const [ital, setItal] = useState(font.axes.find((a) => a.tag ==='ital')?.defaultValue || 5)
  const [opsz, setOpsz] = useState(font.axes.find((a) => a.tag ==='opsz')?.defaultValue || 50)
  const [slnt, setSlnt] = useState(font.axes.find((a) => a.tag ==='slnt')?.defaultValue || 25)
  const [size, setSize] = useState(50)
  const [letterSpace, setLetterSpace] = useState(0)
  const [lineHeight, setLineHeight] = useState(1)
  const [transform, setTransform] = useState('')
  const [align, setAlignment] = useState('left')

  const changeTransform = (transform) => {
    setTransform(transform)
  }
  const changeAlign = (align) => {
    setAlignment(align);
  }

  const style = {
    'fontFamily': font.name,
    'fontVariationSettings': `'wght' ${wght}, 'wdth' ${wdth}, 'cnst' ${cnst}, 'ital' ${ital}, 'opsz' ${opsz}, 'slnt' ${slnt}`,
    'textTransform': transform, 
    'fontSize': size, 
    'textAlign': align, 
    'letterSpacing': letterSpace, 
    'lineHeight': lineHeight 
  }
  const handleChange = (axis, e) => {
    switch(axis) {
      case 'font': setFont(e.target.value); break;
      case 'size': setSize(e.target.value); break;
      case 'wght': setWght(e.target.value); break;
      case 'wdth': setWdth(e.target.value); break;
      case 'cnst': setCnst(e.target.value); break;
      case 'ital': setItal(e.target.value); break;
      case 'opsz': setOpsz(e.target.value); break;
      case 'slnt': setSlnt(e.target.value); break;
      case 'letterSpace': setLetterSpace(e.target.value); break;
      case 'lineHeight': setLineHeight(e.target.value); break;
      default: break;
    }
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
          <Button variant="outlined" size="small" color="primary" style={{margin: '0 10px'}} onClick={e => {changeTransform('uppercase')}}>Uppercase</Button>
          <Button variant="outlined" size="small" color="primary" style={{margin: '0 10px'}} onClick={e => {changeTransform('capitalize')}}>Capitalize</Button>
          <Button variant="outlined" size="small" color="primary" style={{margin: '0 10px'}} onClick={e => {changeTransform('lowercase')}}>Lowercase</Button>
          <Button variant="outlined" size="small" color="primary" style={{margin: '0 10px'}} onClick={e => {changeTransform('')}}>None</Button>
        </Box>

        <h3>Align</h3>
        <Box>
          <Button variant="outlined" size="small" color="primary" style={{margin: '0 10px'}} onClick={e => {changeAlign('left')}}>Left</Button>
          <Button variant="outlined" size="small" color="primary" style={{margin: '0 10px'}} onClick={e => {changeAlign('center')}}>Center</Button>
          <Button variant="outlined" size="small" color="primary" style={{margin: '0 10px'}} onClick={e => {changeAlign('right')}}>Right</Button>
        </Box>

        <h3>Vary</h3>
        <Box sx={{padding: '10px'}}>
          <p>Size</p>
          <Slider size="small" value={size} min={10} max={100} valueLabelDisplay="auto" color="primary" onChange={(e) => handleChange('size', e)} aria-label="Size">Size</Slider>
          <p>Letter Spacing</p>
          <Slider size="small" value={letterSpace} min={-10} max={50} valueLabelDisplay="auto" color="primary" onChange={(e) => handleChange('letterSpace', e)} aria-label="Letter Spacing">Letter Spacing</Slider>
          <p>Line Height</p>
          <Slider size="small" value={lineHeight} min={0} max={200} valueLabelDisplay="auto" color="primary" onChange={(e) => handleChange('lineHeight', e)} aria-label="Line Height">lineHeight</Slider>
          {/* 
          TODO: find a way to access wght variable from axis.tag
          {font.axes.map((axis) => {
            const key = [axis.tag]
            console.log(key)
            return (
              <>
                <p>{axis.name.en}</p>
                <Slider size="small" value={[key]} defaultValue={axis.defaultValue} min={axis.minValue} max={axis.maxValue} valueLabelDisplay="auto" onChange={(e) => handleChange(axis.tag, e)} aria-label={axis.name.en}></Slider>
              </>
            )
          })} */}

          {font.axes && font.axes.some((a) => a.tag ==='wght') && (
            <>
                <p>Weight</p>
                <Slider size="small" value={wght} defaultValue={font.axes.find((a) => a.tag ==='wght').defaultValue} min={font.axes.find((a) => a.tag === 'wght').minValue} max={font.axes.find((a) => a.tag ==='wght').maxValue} valueLabelDisplay="auto" color="primary" onChange={(e) => handleChange('wght', e)} aria-label="Weight"></Slider>
              </>)}
          {font.axes && font.axes.some((a) => a.tag ==='wdth') && (
            <>
              <p>Width</p>
              <Slider size="small" value={wdth} defaultValue={font.axes.find((a) => a.tag ==='wdth').defaultValue} min={font.axes.find((a) => a.tag === 'wdth').minValue} max={font.axes.find((a) => a.tag ==='wdth').maxValue} valueLabelDisplay="auto" color="primary" onChange={(e) => handleChange('wdth', e)} aria-label="Width"></Slider>
            </>)}
          {font.axes && font.axes.some((a) => a.tag ==='cnst') && (
            <>
              <p>Contrast</p>
              <Slider size="small" value={cnst} defaultValue={font.axes.find((a) => a.tag ==='cnst').defaultValue} min={font.axes.find((a) => a.tag === 'cnst').minValue} max={font.axes.find((a) => a.tag ==='cnst').maxValue} valueLabelDisplay="auto" color="primary" onChange={(e) => handleChange('cnst', e)} aria-label="Contrast"></Slider>
            </>)}
          {font.axes && font.axes.some((a) => a.tag ==='ital') && (
            <>
              <p>Italic</p>
              <Slider size="small" value={ital} defaultValue={font.axes.find((a) => a.tag ==='ital').defaultValue} min={font.axes.find((a) => a.tag === 'ital').minValue} max={font.axes.find((a) => a.tag ==='ital').maxValue} valueLabelDisplay="auto" color="primary" onChange={(e) => handleChange('ital', e)} aria-label="Italic"></Slider>
            </>)}
          {font.axes && font.axes.some((a) => a.tag ==='opsz') && (
            <>
              <p>Optical Size</p>
              <Slider size="small" value={opsz} defaultValue={font.axes.find((a) => a.tag ==='opsz').defaultValue} min={font.axes.find((a) => a.tag === 'opsz').minValue} max={font.axes.find((a) => a.tag ==='opsz').maxValue} valueLabelDisplay="auto" color="primary" onChange={(e) => handleChange('opsz', e)} aria-label="Optical Size"></Slider>
            </>)}
          {font.axes && font.axes.some((a) => a.tag ==='slnt') && (
            <>
              <p>Slant</p>
              <Slider size="small" value={slnt} defaultValue={font.axes.find((a) => a.tag ==='slnt').defaultValue} min={font.axes.find((a) => a.tag === 'slnt').minValue} max={font.axes.find((a) => a.tag ==='slnt').maxValue} valueLabelDisplay="auto" color="primary" onChange={(e) => handleChange('slnt', e)} aria-label="Slant"></Slider>
            </>)}
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
