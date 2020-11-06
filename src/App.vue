<template>
  <main>
    <form>
      <input
        type="file"
        @input="({ target: { files } }) => setProject(files[0])"
        accept=".json"
      />
    </form>
    <form>
      <select
        v-show="mapNames.length > 0"
        @input="({ target: { value } }) => selectedMapName = value"
      >
        <option
          v-for="mapName in mapNames"
          :key="mapName"
          :value="mapName"
          :selected="mapName === selectedMapName"
        >
          {{ mapName }}
        </option>
      </select>
    </form>
    <button 
      @click="() => copyable.copy()"
      v-show="mapNames.length > 0"
    >
      Copy map blueprint
    </button>
    <pre><code>{{ mapBlueprint }}</code></pre>
  </main>
</template>

<script>
import { ref, computed, watchEffect } from 'vue'
import { useCopyable } from '@baleada/vue-composition'

export default {
  setup () {
    const project = ref({}),
          setProject = file => {
            const reader = new FileReader()
            reader.onload = ({ target: { result } }) => {
              project.value = JSON.parse(result)
              selectedMapName.value = mapNames.value[0]
            }
            reader.readAsText(file)
          },
          mapNames = computed(() => project.value?.maps?.map(({ name }) => name) || []),
          selectedMapName = ref(''),
          mapBlueprint = computed(() => mapNames.value.length > 0 ? toMapBlueprint({ project: project.value, mapName: selectedMapName.value }) : '{}')

    const copyable = useCopyable(mapBlueprint.value)

    watchEffect(() => copyable.value.setString(mapBlueprint.value))

    return {
      project,
      setProject,
      mapNames,
      selectedMapName,
      mapBlueprint,
      copyable,
    }
  }
}

function toMapBlueprint ({ project, mapName }) {
  const map = project.maps.find(map => map.name === mapName),
        view = project.perspectives.find(view => view._id === map.defaultPerspective),
        mapBlueprint = JSON.parse(JSON.stringify(project, null, 2)),
        unnecessaryFields = ['attributeRelevance', 'attributes', 'defaultMap', 'defaultPerspective', 'description', 'name', 'proxyImages', 'version']

  unnecessaryFields.forEach(field => {
    delete mapBlueprint[field]
  })

  let meta = [
    { name: 'maps', keeper: map },
    { name: 'perspectives', keeper: view }
  ]
  meta.forEach((array, i) => {
    mapBlueprint[array.name] = mapBlueprint[array.name].filter(item => item._id === array.keeper._id)
  })

  let items = [
    { name: 'elements', keepers: map.elements, id: 'element' },
    { name: 'connections', keepers: map.connections, id: 'connection' },
    { name: 'loops', keepers: map.loops, id: 'loop' }
  ]
  items.forEach(array => mapBlueprint[array.name] = mapBlueprint[array.name].filter(item => array.keepers.map(keeper => keeper[array.id]).includes(item._id)))

  return JSON.stringify(mapBlueprint, null, 2)
}
</script>
