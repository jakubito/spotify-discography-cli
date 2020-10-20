import { IConfig } from '@oclif/config'
import { pathExistsSync, readJsonSync, ensureFileSync, writeJsonSync } from 'fs-extra'
import { isValidConfigKey } from '../helpers'
import { ConfigKey, ConfigValue, ConfigValues, ConfigInterface } from '../types'

const defaultValues: ConfigValues = {
  authServerPort: 10101,
}

export default class Config implements ConfigInterface {
  values = defaultValues

  private path: string

  constructor(oclifConfig: IConfig) {
    this.path = `${oclifConfig.configDir}/config.json`

    if (pathExistsSync(this.path)) {
      this.values = readJsonSync(this.path)
    } else {
      this.persist()
    }
  }

  set(item: ConfigValues | ConfigKey, value?: ConfigValue) {
    if (isValidConfigKey(item)) {
      this.values[item] = value
    } else {
      this.values = {
        ...this.values,
        ...item,
      }
    }

    this.persist()
  }

  reset() {
    this.values = defaultValues
    this.persist()
  }

  private persist() {
    ensureFileSync(this.path)
    writeJsonSync(this.path, this.values)
  }
}
