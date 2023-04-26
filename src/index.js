const { Canvas, Image, ImageData } = require('canvas')
const { JSDOM } = require('jsdom')
const { mkdirSync, existsSync } = require('fs')

// @See https://docs.opencv.org/4.5.4/dc/de6/tutorial_js_nodejs.html for details.
const loadOpenCV = (rootDir = '/work', localRootDir = process.cwd()) => new Promise((resolve, reject) => {
    try {
        // Check if opencv is already loaded.
        if (global.Module && global.Module.onRuntimeInitialized && global.cv && global.cv.imread) {
            resolve()
        }
        global.Module = {
            onRuntimeInitialized: () => {
                // We change emscripten current work directory to 'rootDir' so relative paths are resolved
                // relative to the current local folder, as expected
                cv.FS.chdir(rootDir)
                resolve()
            },
            preRun() {
                // preRun() is another callback like onRuntimeInitialized() but is called just before the
                // library code runs. Here we mount a local folder in emscripten filesystem and we want to
                // do this before the library is executed so the filesystem is accessible from the start
                const FS = global.Module.FS
                // create rootDir if it doesn't exists
                if(!FS.analyzePath(rootDir).exists) {
                    FS.mkdir(rootDir);
                }
                // create localRootFolder if it doesn't exists
                if(!existsSync(localRootDir)) {
                    mkdirSync(localRootDir, { recursive: true});
                }
                // FS.mount() is similar to Linux/POSIX mount operation. It basically mounts an external
                // filesystem with given format, in given current filesystem directory.
                FS.mount(FS.filesystems.NODEFS, { root: localRootDir}, rootDir);
            }
        }
        global.cv = require('../lib/opencv.js')
    } catch (e) {
        reject(e)
    }
})

 function initDOM() {
    const dom = new JSDOM()
     global.document = dom.window.document
     global.Image, global.HTMLImageElement = Image
     global.HTMLCanvasElement = Canvas
     global.ImageData = ImageData
     return dom
 }

async function initOpenCV() {
    initDOM()
    await loadOpenCV()
}

 module.exports = { initOpenCV }