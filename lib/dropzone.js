import { storeFont } from './database'

const fileTypes = ['ttf', 'otf', 'woff']; 
export async function dropHandler(ev) {
    document.getElementById('dropzone').classList.remove('dragover');
    ev.preventDefault();

    if (ev.dataTransfer.items) {
        const reader = new FileReader()
        for (var i = 0; i < ev.dataTransfer.items.length; i++) {
            if (ev.dataTransfer.items[i].kind === 'file') {
                const file = ev.dataTransfer.items[i].getAsFile();
                const extension = file.name.split('.').pop().toLowerCase()
                const isValid = fileTypes.indexOf(extension) > -1
                if(!isValid) return { status: 'error', msg: `Unsupported File Type: .${extension}` }
                reader.readAsArrayBuffer(file)
                return new Promise(function(resolve, _) {
                    reader.onloadend = async function() {
                        await storeFont(reader.result, file.name)
                        resolve({ status: 'success', msg: '' })
                    }
                })
            }
        }
    }
}
  
export function dragOverHandler(ev) {
    document.getElementById('dropzone').classList.add('dragover');
    ev.preventDefault();
}

export function dragLeaveHandler(ev) {
    document.getElementById('dropzone').classList.remove('dragover');
    ev.preventDefault();
}
