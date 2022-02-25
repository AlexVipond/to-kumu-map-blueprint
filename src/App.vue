<template>
  <main class="h-screen w-screen flex flex-col overflow-y-scroll overflow-x-hidden items-center bg-indigo-50 gap-6 px-8 py-11">
    <section class="w-full max-w-2xl flex items-center justify-between">
      <h1 class="text-sm tracking-widest font-bold uppercase text-indigo-900">To Map Blueprint</h1>
      <span class="text-sm tracking-widest font-bold uppercase text-indigo-900">Built by <a href="https://kumu.io" class="underline hover:text-indigo-600 transition duration-150">Kumu</a></span>
    </section>
    <section class="w-full max-w-2xl p-6 bg-white rounded shadow-md space-y-4">
      <h2 class="text-sm tracking-widest font-bold uppercase text-gray-800">Instructions</h2>
      <ol class="list-decimal pl-6 space-y-3">
        <li><a href="https://docs.kumu.io/guides/export.html#downloading-a-project-blueprint" class="text-indigo-600 hover:underline hover:text-indigo-700 transition duration-150">Export your Kumu project as JSON.</a></li>
        <li>Upload your JSON file to this page. (To protect privacy, your data will stay in your browser—this page never contacts any servers.)</li>
        <li>From the dropdown that appears, select the specific map whose blueprint you need.</li>
        <li>Indicate whether or not you're using this tool to duplicate the map in its original project.</li>
        <li>Download your map's JSON file to your computer.</li>
        <li>Drag-and-drop the JSON file onto any Kumu project to import the map with all of its data and settings.</li>
      </ol>
    </section>
    <section class="w-full max-w-2xl p-6 bg-white rounded shadow-md flex flex-col gap-3">
      <form class="flex flex-col items-center">
        <label
          for="upload"
          tabindex="0"
          class="btn"
        >
          <input
            type="file"
            id="upload"
            @input="event => setProject({ fileName: (event.target as HTMLInputElement).value, file: (event.target as HTMLInputElement).files[0] })"
            accept=".json"
            class="hidden"
          />
          <span>Upload</span>
        </label>
      </form>
      <span class="mx-auto">{{ fileName }}</span>
      <section
        v-show="typeof mapBlueprint?.message === 'string'"
        v-html="mapBlueprint?.message"
        class="flex flex-col gap-3 p-4 rounded bg-red-200 text-red-900"
      />
      <form v-show="typeof mapBlueprint?.message !== 'string'" class="flex flex-col gap-4 items-center">
        <select
          v-show="mapNames.length > 0"
          @input="event => selectedMapName = (event.target as HTMLSelectElement).value"
          class="form-select max-w-full"
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
        <label for="duplicatesMapForOriginalProject" class="flex items-center gap-2">
          <input
            type="checkbox"
            id="duplicatesMapForOriginalProject"
            v-model="duplicatesMapForOriginalProject"
          />
          <span>I want to import my map back into its original project as a duplicate.</span>
        </label>
        <input
          v-show="duplicatesMapForOriginalProject"
          type="text"
          placeholder="Duplicate map's new name"
          v-model="duplicateMapName"
        />
      </form>
    </section>
    <section class="w-full max-w-2xl p-6 bg-white rounded shadow-md space-y-5">
      <section class="space-x-4">
        <button
          type="button"
          @click="() => downloadable.download(`${fileName.replace(/\.json$/, '')} ${selectedMapName}`)"
          v-show="mapNames.length > 0"
          class="btn"
        >
          Download blueprint
        </button>
      </section>
      <pre class="max-h-[640px] bg-indigo-900 text-indigo-200 p-6 rounded overflow-scroll"><code>{{ stringifiedMapBlueprint }}</code></pre>
    </section>
  </main>
</template>

<script setup lang="ts">
import { ref, computed, watchEffect } from 'vue'
import { toMapBlueprint } from './toMapBlueprint'
import { Downloadable } from './Downloadable'

const project = ref<Record<any, any>>({}),
      fileName = ref(''),
      setProject = ({ fileName: f, file }) => {
        const reader = new FileReader()
        reader.onload = ({ target: { result } }) => {
          project.value = JSON.parse(result as string)
          fileName.value = f.replace(/\\/g, '/').split('/').reverse()[0]
          selectedMapName.value = mapNames.value[0]
        }
        reader.readAsText(file)
      },
      mapNames = computed(() => project.value?.maps?.map(({ name }) => name) || []),
      selectedMapName = ref(''),
      duplicatesMapForOriginalProject = ref(false),
      duplicateMapName = ref(''),
      mapBlueprint = computed(() =>
        mapNames.value.length > 0
          ? toMapBlueprint({
            project: project.value,
            mapName: selectedMapName.value,
            duplicatesMapForOriginalProject: duplicatesMapForOriginalProject.value,
            duplicateMapName: duplicateMapName.value,
          })
          : {}
      ),
      stringifiedMapBlueprint = computed(() => 
        typeof mapBlueprint.value?.message === 'string'
          ? '{}'
          : JSON.stringify(mapBlueprint.value, null, 2)
      )

const downloadable = ref(new Downloadable(mapBlueprint.value))

watchEffect(() => downloadable.value.setJson(mapBlueprint.value))
</script>
