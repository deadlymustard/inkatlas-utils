import { inkAtlasTemplate, blah } from "./templates";
import { slugify } from "./utils";

export { generateAtlasJson };

function generateAtlasJson(activeDoc, depotPath, depotPath1080p) {
  const atlasTemplate = inkAtlasTemplate();
  const atlasMappings = generateAtlasMappings(activeDoc);

  atlasTemplate.Data.RootChunk.Properties.slots.Elements[0].Properties.texture.DepotPath =
    depotPath;
  atlasTemplate.Data.RootChunk.Properties.slots.Elements[1].Properties.texture.DepotPath =
    depotPath1080p;

  atlasTemplate.Data.RootChunk.Properties.slots.Elements[0].Properties.parts =
    atlasMappings;
  atlasTemplate.Data.RootChunk.Properties.slots.Elements[1].Properties.parts =
    atlasMappings;

  return atlasTemplate;
}

function generateAtlasMappings(activeDoc) {
  const allLayers = activeDoc.layers;
  return allLayers
  .filter(layer => layer.name !== 'Background')
  .map((layer) =>
    generateAtlasMappingForLayer(activeDoc, layer)
  );
}

function generateAtlasMappingForLayer(activeDoc, layer) {
  const height = activeDoc.height;
  const width = activeDoc.width;

  const atlasMappingTemplate = blah();

  atlasMappingTemplate.Properties.clippingRectInUVCoords.Properties = {
    Bottom: layer.bounds.bottom / height,
    Left: layer.bounds.left / width,
    Right: layer.bounds.right / width,
    Top: layer.bounds.top / height,
  };
  atlasMappingTemplate.Properties.partName = slugify(layer.name);

  return atlasMappingTemplate;
}
