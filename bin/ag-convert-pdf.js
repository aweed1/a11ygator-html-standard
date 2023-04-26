#! /usr/bin/env node

const yargs = require('yargs');
const fs = require('fs');
const { Poppler } = require('node-poppler');
const { parse, join } = require('path');
const { mkdirp } = require('mkdirp');
const { rimraf } = require('rimraf');
const { initOpenCV } = require('../src/index')
const { loadImage } = require('canvas')

// Define the usage documentation.
const usage = '\nUsage: ag-convert-pdf [options] <file>';

// Parse the command line arguments.
const options = yargs 
    .usage(usage)
    .option('p', { alias: 'pdf', describe: 'PDF file to convert', type: 'string' })
    .option('d', { alias: 'data', describe: 'Data to use in the template', type: 'string' })
    .option('o', { alias: 'output', describe: 'Output directory', type: 'string' })
    .option('t', { alias: 'template', describe: 'Template file', type: 'string' })
    .option('v', { alias: 'verbose', describe: 'Verbose output', type: 'boolean' })
    .help('h').alias('h', 'help')
    .argv;

const { p: pdfpath, o: outdirpath } = options

// Read the PDF file.
const file = fs.readFileSync(pdfpath);
const poppler = new Poppler('/usr/bin');

(async () => {

    // outdir will be the directory where the output files will be written.
    let outdir
    // options is an object that will be passed to the poppler functions
    let options
    // name is the name of the odf file
    let name
    // outfile is the output file name
    let outfile

    // Create the output directory if it does not already exist.
    await mkdirp(outdirpath);

    // Remove the output directory if it already exists.
    await rimraf(outdirpath);

    // Convert the PDF to text.
    name = parse(pdfpath).name
    outdir = join(outdirpath, name, 'text');
    outfile = join(outdir, name + '.txt');
    // options = { generateHtmlMetaFile: true, generateTsvFile: true }
    await mkdirp(outdir);
    await poppler.pdfToText(file, outfile, options)

    // Convert the PDF file to html.
    name = parse(pdfpath).name
    outdir = join(outdirpath, name, 'html');
    outfile = join(outdir, name + '.html');
    options = { dataUrls: true, extractHidden: true, zoom: 1.5, singlePage: true }
    await mkdirp(outdir);
    await poppler.pdfToHtml(file, outfile, options)

    // Convert the PDF to images.
    name = parse(pdfpath).name
    outdir = join(outdirpath, name, 'cairo');
    outfile = join(outdir, name);
    options = { pngFile: true, singleFile: true }
    await mkdirp(outdir);
    await poppler.pdfToCairo(file, outfile, options)

    // Load opencv -- we will use it to detect blocks in the PDF images
    console.log('Loading opencv...')
    await initOpenCV()
    const cv = global.cv
    console.log('Loaded!')

    // Detect the blocks of text / images / math / gargbage / etc...
    // test on the first file
    const imgfilepath = outfile + '.png'
    console.log(imgfilepath)
    const img = await loadImage(imgfilepath)
    const imgsrc = await cv.imread(img)
    // Convert to grayscale.
    let gray = new cv.Mat()
    cv.cvtColor(imgsrc, gray, cv.COLOR_RGBA2GRAY, 0)
    // Add gaussian blur.
    let blurred = new cv.Mat()
    cv.GaussianBlur(gray, blurred, new cv.Size(5, 5), 0)
    // Add threshold.
    let thresholded = new cv.Mat()
    cv.threshold(blurred, thresholded, 0, 255, cv.THRESH_OTSU + cv.THRESH_BINARY_INV)
    // Add dilate.
    const rectkernel = cv.getStructuringElement(cv.MORPH_RECT, new cv.Size(18, 18))
    let dilated = new cv.Mat()
    cv.dilate(thresholded, dilated, rectkernel)
    // Find contours.
    let contours = new cv.Mat()
    let hierarchy = new cv.Mat()

    console.log({ hierarchy, contours, dilated })
    cv.findContours(dilated, contours, hierarchy, cv.RETR_EXTERNAL, cv.CHAIN_APPROX_NONE)

    // OCR with opencv
    // const ocr = new cv.text.OCRTesseract()
    // const txt = ocr.run(gray)
    // console.log(txt)

    // cleanup
    gray.delete()
    blurred.delete()
    thresholded.delete()
    dilated.delete()
    contours.delete()
    hierarchy.delete()
    rectkernel.delete()

})();
