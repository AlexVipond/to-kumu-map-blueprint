export class Downloadable {
  json: Record<any, any>
  constructor (json: Record<any, any>) {
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
