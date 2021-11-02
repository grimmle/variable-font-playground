import Dexie from 'dexie';

const db = new Dexie("Variable-Font-Playground");
db.version(1).stores({ fonts: "++id,buffer,file_name" });
 
export async function storeFont(font, name) {
    return await db.fonts.add({buffer: font, file_name: name});
}

export async function readFonts() {
    const fonts = await db.fonts.toArray()
    return fonts;
}