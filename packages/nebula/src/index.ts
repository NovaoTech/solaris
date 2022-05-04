import * as solaris from 'solaris-types'

export function hashFile(file: solaris.File) {
  /**
   * Function used to hash each asset. Unsafe hash, not salted.
   * @internal
   */

  // Return a `File` object with an unsalted hash.
  return {name: file.name, hash: sha512.crypt(file.bytes, 'saltysalt').replace('$6$saltysalt$', '')}
}

export function particulate(files: Array<any>): Array<any> {
  /**
   * Function used to particulate a list of files into a list of assets.
   * @param files - Array of files to be particulated.
   * @returns array of RequiredAssets
   */

  // Initialize the requiredAssets array
  let requiredAssets: Array<any> = []

  // Hash each file and add the resulting `RequiredAsset` to the array
  for (let fileIndex = 0; fileIndex < files.length; fileIndex++) {
    requiredAssets.push(hashFile(files[fileIndex]))
  }

  // Return the required assets
  return requiredAssets
}

export function buildProject(
  files: Array<any>,
  meta: Object = {name: 'Untitled Project', author: 'Unassigned', license: 'Copyright'}
): solaris.Project {
  /**
   * Function used to assemble a project into a compact configuration file.
   *
   * @param files - Array of File objects. Files contained in the .sb3 directory.
   * @param meta - An object representing the metadata of the project.
   *
   * @returns a javascript object representing the compressed project.
   */

  // Generate a list of all required assets.
  let requiredAssets: Array<any> = particulate(files)

  // Add the list of assets to the configuration
  let project: solaris.Project = {config: meta, assets: requiredAssets}

  // Return the project configuration
  return project
}

import {sha512} from 'sha512-crypt-ts'
