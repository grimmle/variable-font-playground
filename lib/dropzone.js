import { storeFont } from './database'

export async function dropHandler(ev) {
    document.getElementById('dropzone').classList.remove('dragover');
    ev.preventDefault();

    if (ev.dataTransfer.items) {
        const reader = new FileReader()
        for (var i = 0; i < ev.dataTransfer.items.length; i++) {
            if (ev.dataTransfer.items[i].kind === 'file') {
                const file = ev.dataTransfer.items[i].getAsFile();
                reader.readAsArrayBuffer(file)
                return new Promise(function(resolve, _) {
                    reader.onloadend = async function() {
                        await storeFont(reader.result, file.name)
                        resolve(true)
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
