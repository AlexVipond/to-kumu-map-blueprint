<template>
  <main class="h-screen w-screen flex flex-col overflow-y-scroll overflow-x-hidden items-center bg-indigo-40 gap-6 px-8 py-11">
    <section class="w-full max-w-6 flex items-center justify-between">
      <h1 class="text-3 tracking-3 font-6 uppercase text-indigo-80">To Map Blueprint</h1>
      <span class="text-3 tracking-3 font-6 uppercase text-indigo-80">Built by <a href="https://kumu.io" class="underline hover:text-indigo-90 transition duration-3">Kumu</a></span>
    </section>
    <section class="w-full max-w-6 p-6 bg-gray-5 rounded-4 shadow-5 space-y-4">
      <h2 class="text-3 tracking-3 font-6 uppercase text-gray-80">Instructions</h2>
      <ol class="list-decimal pl-6 space-y-3">
        <li><a href="https://docs.kumu.io/guides/export.html#downloading-a-project-blueprint" class="text-indigo-60 hover:underline hover:text-indigo-70 transition duration-3">Export your Kumu project as JSON.</a></li>
        <li>Upload your JSON file to this page. (To protect privacy, your data will stay in your browser—this page never contacts any servers.)</li>
        <li>From the dropdown that appears, select the specific map whose blueprint you need.</li>
        <li>Copy the map blueprint to your clipboard, or download its JSON file to your computer.</li>
      </ol>
    </section>
    <section class="w-full max-w-6 p-6 bg-gray-5 rounded-4 shadow-5 flex flex-col gap-3">
      <form class="flex flex-col items-center">
        <label
          for="upload"
          tabindex="0"
          :class="btn"
        >
          <input
            type="file"
            id="upload"
            @input="({ target: { value, files } }) => setProject({ fileName: value, file: files[0] })"
            accept=".json"
            class="hidden"
          />
          <span>Upload</span>
        </label>
      </form>
      <span class="mx-auto">{{ fileName && `${fileName}.json` || fileName }}</span>
      <form class="flex flex-col items-center">
        <select
          v-show="mapNames.length > 0"
          @input="({ target: { value } }) => selectedMapName = value"
          class="form-select"
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
    </section>
    <section class="w-full max-w-6 p-6 bg-gray-5 rounded-4 shadow-5 space-y-5">
      <section class="space-x-4">
        <button
          type="button"
          @click="() => copyable.copy()"
          v-show="mapNames.length > 0"
          :class="btn"
        >
          Copy map blueprint
        </button>
        <button
          type="button"
          @click="() => downloadable.download(`${fileName} ${selectedMapName}`)"
          v-show="mapNames.length > 0"
          :class="btn"
        >
          Download map blueprint
        </button>
      </section>
      <pre class="bg-gray-10 -shadow-4 p-6 rounded-4 overflow-x-scroll"><code>{{ stringifiedMapBlueprint }}</code></pre>
    </section>
  </main>
</template>

<script>
import { ref, computed, watchEffect } from 'vue'
import { useCopyable } from '@baleada/vue-composition'
import { default as path } from 'path'

const { parse } = path

export default {
  setup () {
    const project = ref({}),
          fileName = ref(''),
          setProject = ({ fileName: f, file }) => {
            const reader = new FileReader()
            reader.onload = ({ target: { result } }) => {
              project.value = JSON.parse(result)
              fileName.value = parse(f.replace(/\\/g, '/')).name
              selectedMapName.value = mapNames.value[0]
            }
            reader.readAsText(file)
          },
          mapNames = computed(() => project.value?.maps?.map(({ name }) => name) || []),
          selectedMapName = ref(''),
          mapBlueprint = computed(() => mapNames.value.length > 0 ? toMapBlueprint({ project: project.value, mapName: selectedMapName.value }) : {}),
          stringifiedMapBlueprint = computed(() => JSON.stringify(mapBlueprint.value, null, 2))

    const copyable = useCopyable(mapBlueprint.value)

    watchEffect(() => copyable.value.setString(stringifiedMapBlueprint.value))

    const downloadable = ref(new Downloadable(mapBlueprint.value))

    watchEffect(() => downloadable.value.setJson(mapBlueprint.value))

    return {
      project,
      fileName,
      setProject,
      mapNames,
      selectedMapName,
      stringifiedMapBlueprint,
      copyable,
      downloadable,
      btn,
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

  return mapBlueprint
}


class Downloadable {
  constructor (json) {
    this.json = json
  }

  get stringified () {
    return JSON.stringify(this.json, null, 2)
  }

  setJson (json) {
    this.json = json
    return this
  }

  download (filename) {
    const data = `text/json;charset=utf-8,${encodeURIComponent(this.stringified)}`,
          link = document.createElement("a"),
          url = `data:${data}`

    link.setAttribute('href', url)
    link.setAttribute('download', `${simpleSlugify(filename)}.json`)
    link.style.visibility = 'hidden'

    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)

    return this
  }
}

function simpleSlugify (string) {
  return string
    .replace(/'/g, '')
    .replace(/[^a-záéíóúñäëïöüçøñâêîôû0-9]/gi, '-')
    .replace(/-{2,}/g, '-')
    .replace(/^-/, '').replace(/-$/, '')
    .toLowerCase()
}

const btn = 'p-2 rounded-4 bg-indigo-10 text-indigo-90 shadow-4 hover:shadow-5 hover:scale-110 active:shadow-4 active:scale-100 transition duration-3 transform cursor-pointer'
</script>

