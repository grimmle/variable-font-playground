import { storeFont } from './database'
import { updateElementPosition } from './helpers';

const FILE_TYPES = ['ttf', 'otf', 'woff'];

export async function dropHandler(ev) {
    document.getElementById('dropzone').classList.remove('dragover');
    ev.preventDefault();

    if (ev.dataTransfer.items) {
        const reader = new FileReader()
        for (var i = 0; i < ev.dataTransfer.items.length; i++) {
            if (ev.dataTransfer.items[i].kind === 'file') {
                const file = ev.dataTransfer.items[i].getAsFile();
                const extension = file.name.split('.').pop().toLowerCase()
                const isValid = FILE_TYPES.indexOf(extension) > -1
                if (!isValid) return { status: 'error', msg: `Unsupported File Type: .${extension}` }
                reader.readAsArrayBuffer(file)
                return new Promise(function (resolve, _) {
                    reader.onloadend = async function () {
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
    const indicator = document.getElementById('drop-indicator')
    indicator.style.position = "absolute";
    indicator.classList.add('active');
    updateElementPosition(indicator, ev.pageX, ev.pageY);
    ev.preventDefault();
}

export function dragLeaveHandler(ev) {
    document.getElementById('drop-indicator').classList.remove('active');
    document.getElementById('dropzone').classList.remove('dragover');
    ev.preventDefault();
}
