const ns = require('node-sketch')
const path = require('path')
const fs = require('fs')

function safeMkdir(dir) {
    try {
        fs.mkdirSync(dir)
    } catch {
        // pass
    }
}

function getGuid(layer) {
    return layer.do_objectID.substring(0, 8).toLowerCase()
}

function stringify(json) {
    return JSON.stringify(json, null, 2)
}

function layerGuids(layers) {
    if (layers) {
        return layers.map(getGuid)
    } else {
        return undefined
    }
}

function saveDocument(sketch, outDir) {
    const documentJson = stringify(sketch.document)
    const metaJson = stringify(sketch.meta)
    const userJson = stringify(sketch.user)
    fs.writeFileSync(path.join(outDir, 'document.json'), documentJson)
    fs.writeFileSync(path.join(outDir, 'meta.json'), metaJson)
    fs.writeFileSync(path.join(outDir, 'user.json'), userJson)
}

function saveImages(repo, outDir) {
    repo.forEach(async (name, file) => {
        if (!name.startsWith('images/')) return
        const buf = await file.async('nodebuffer')
        fs.writeFileSync(path.join(outDir, name), buf)
    })
}

function saveLayer(layerDir, layer) {
    const layers = layer.layers
    layer.layers = layerGuids(layers)
    const outLayerPath = path.join(layerDir, getGuid(layer))
    fs.writeFileSync(`${outLayerPath}.json`, stringify(layer))
    if (!layers) return
    safeMkdir(outLayerPath)
    layers.forEach(saveLayer.bind(null, outLayerPath))
}

function saveArtboard(artboardDir, artboard) {
    const layers = artboard.layers
    artboard.layers = layerGuids(layers)
    const outAbPath = path.join(artboardDir, getGuid(artboard))
    safeMkdir(outAbPath)
    const outAbFilePath = `${outAbPath}.json`
    fs.writeFileSync(outAbFilePath, stringify(artboard))
    layers.forEach(saveLayer.bind(null, outAbPath))
}

function savePage(pageDir, page) {
    const artboards = page.layers
    page.layers = layerGuids(artboards)
    const outPagePath = path.join(pageDir, getGuid(page))
    safeMkdir(outPagePath)
    const outPageFilePath = `${outPagePath}.json`
    fs.writeFileSync(outPageFilePath, stringify(page))
    artboards.forEach(saveArtboard.bind(null, outPagePath))
}

module.exports = async function(sketchFile, outDir) {
    const sketch = await ns.read(sketchFile)
    saveDocument(sketch, outDir)
    safeMkdir(path.join(outDir, 'images'))
    saveImages(sketch.repo, outDir)
    const pageDir = path.join(outDir, 'pages')
    safeMkdir(pageDir)
    sketch.pages.forEach(savePage.bind(null, pageDir))
}