import * as solaris from 'solaris-types'

export function hashFile(file: solaris.File): solaris.Asset {
  /**
   * Function used to hash each asset. Unsafe hash, not salted.
   * @internal
   */

  // Return an `Asset` object with an unsalted hash.
  return {bytes: file.bytes, hash: sha512.crypt(file.bytes, 'saltysalt').replace('$6$saltysalt$', '')}
}

export function particulate(files: Array<solaris.File>): {
  assets: Array<solaris.Asset>
  requiredAssets: Array<solaris.RequiredAsset>
} {
  /**
   * Function used to particulate a list of files into a list of assets.
   * @param files - Array of files to be particulated.
   * @returns an object, with the properties assets and requiredAssets which contain arrays of their respective objects.
   */

  // Initialize the requiredAssets array
  let requiredAssets: Array<solaris.RequiredAsset> = []
  let assets: Array<solaris.Asset> = []

  // Hash each file and add the resulting `RequiredAsset` to the array
  for (let fileIndex = 0; fileIndex < files.length; fileIndex++) {
    let hashedFile = hashFile(files[fileIndex])
    requiredAssets.push({location: files[fileIndex].location, hash: hashedFile.hash})
    assets.push(hashedFile)
  }

  // Return the required assets
  return {requiredAssets: requiredAssets, assets: assets}
}

export function buildProject(
  files: Array<solaris.File>,
  meta: solaris.ProjectConfig = {name: 'Untitled Project', author: 'Unassigned', license: 'all-rights-reserved'}
): {project: solaris.ProjectPackage; assets: Array<solaris.Asset>} {
  /**
   * Function used to assemble a project into a compact descriptive file.
   *
   * @param files - Array of File objects representing Files contained in the .sb3 directory.
   * @param meta - An object representing the metadata of the project.
   *
   * @returns a javascript object containing the compressed project and the assets.
   */

  // Generate a list of all required assets.
  let particulatedProject: {assets: Array<solaris.Asset>; requiredAssets: Array<solaris.RequiredAsset>} =
    particulate(files)

  // Add the list of assets to the configuration
  let project: solaris.ProjectPackage = {config: meta, assets: particulatedProject.requiredAssets}

  // Return the project configuration
  return {project: project, assets: particulatedProject.assets}
}

import {sha512} from 'sha512-crypt-ts'
