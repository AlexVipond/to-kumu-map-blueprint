export function toMapBlueprint ({ project, mapName, duplicatesMapForOriginalProject }: {
  project: Record<any, any>,
  mapName: string,
  duplicatesMapForOriginalProject: boolean,
}): Record<any, any> {
  const map = project.maps.find(map => map.name === mapName),
        view = project.perspectives.find(view => view._id === map.defaultPerspective),
        mapBlueprint = JSON.parse(JSON.stringify(project, null, 2)),
        unnecessaryFields = ['attributeRelevance', 'attributes', 'defaultMap', 'defaultPerspective', 'description', 'name', 'proxyImages', 'version']

  if (!view) {
    return { message: '<p>Error: could not find a default view for your map.</p><p>To troubleshoot, return to your project, right click the background of the map, and select <b>View &gt; Make this the default view</b>.</p><p>Then, download the JSON blueprint again, and upload it here.</p>' }
  }

  for (const field of unnecessaryFields) {
    delete mapBlueprint[field]
  }

  let meta = [
    { name: 'maps', keeper: map },
    { name: 'perspectives', keeper: view }
  ]

  for (const { name, keeper } of meta) {
    mapBlueprint[name] = mapBlueprint[name].filter(item => item._id === keeper._id)
  }

  let items = [
    { name: 'elements', keepers: map.elements, id: 'element' },
    { name: 'connections', keepers: map.connections, id: 'connection' },
    { name: 'loops', keepers: map.loops, id: 'loop' }
  ]

  for (const { name, keepers, id } of items) {
    mapBlueprint[name] = mapBlueprint[name].filter(item => keepers.map(keeper => keeper[id]).includes(item._id))
  }

  if (!duplicatesMapForOriginalProject) {
    return mapBlueprint
  }

  return {

  }
    
}
