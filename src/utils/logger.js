import config from '../config/config.json' with { type : 'json'};
import membersId from '../config/membersId.json' with { type : 'json' };
import getApplicationCommands from './getApplicationCommands.js';
import areCommandsDifferent from './areCommandDifferent.js';
import fs from 'fs/promises';
import path from 'path';
// import { fileURLToPath } from 'url';

/**
 * Recursively retrieve files and folders from a directory
 * @param {string} directory - Base directory to search
 * @param {boolean} [foldersOnly=false] - Whether to return only folders
 * @returns {Promise<{files: string[], folders: string[]}>}
 */
const getFilesRecursively = async (directory, foldersOnly = false) => {
    const fileNames = { files: [], folders: [] };

    const readDirectory = async (currentDir) => {
        try {
            const entries = await fs.readdir(currentDir, { withFileTypes: true });

            for (const entry of entries) {
                const fullPath = path.join(currentDir, entry.name);

                if (entry.isDirectory()) {
                    fileNames.folders.push(fullPath);
                    await readDirectory(fullPath);
                } else if (entry.isFile() && !foldersOnly) {
                    fileNames.files.push(fullPath);
                }
            }
        } catch (error) {
            console.error(`Error reading directory ${currentDir}:`, error);
        }
    };

    await readDirectory(directory);
    return fileNames;
};

/**
 * Organize files by main folders
 * @param {string} basePath - Base directory path
 * @returns {Promise<Array<{folder: string, files: string[]}>>}
 */
const organizeFilesByMainFolders = async (basePath) => {
    const { files, folders } = await getFilesRecursively(basePath);
    const result = [];

    for (const folder of folders) {
        const mainFolder = folder.replace(`${path.join(basePath, path.sep)}`, '').split(path.sep)[0];
        
        let folderEntry = result.find(entry => entry.folder === mainFolder);
        if (!folderEntry) {
            folderEntry = { folder: mainFolder, files: [] };
            result.push(folderEntry);
        }

        const relativeFolderPath = folder.replace(`${path.join(basePath, path.sep)}`, '');
        const matchedFiles = files
            .map(file => file.replace(`${path.join(basePath, path.sep)}`, ''))
            .filter(file => file.startsWith(relativeFolderPath));

        folderEntry.files.push(...matchedFiles);
    }

    return result.map(entry => ({
        ...entry,
        files: [...new Set(entry.files)]
    }));
};

/**
 * Dynamically import modules from specified directory
 * @param {string} directory - Base directory for module search
 * @param {string} [targetFolder=null] - Optional specific folder to target
 * @returns {Promise<Object>} Imported modules
 */
const getObjectModules = async (directory, targetFolder = null) => {
    const organizedFiles = await organizeFilesByMainFolders(directory);
    const modules = {};

    for (const folder of organizedFiles) {
        if (targetFolder && folder.folder !== targetFolder) continue;

        const folderModules = [];
        for (const file of folder.files) {
            const modulePath = path.resolve(directory, file);
            
            try {
                if (path.extname(modulePath) !== '.js') continue;
                
                const module = await import(`file://${modulePath}`);
                folderModules.push(module);
            } catch (error) {
                console.error(`Failed to load module from: ${modulePath}`, error);
            }
        }

        modules[folder.folder] = folderModules;
    }

    return modules;
};

/**
 * Extract and flatten modules from imported objects
 * @param {string} basePath - Base directory path
 * @param {string} [targetFolder=null] - Optional specific folder to target
 * @returns {Promise<Array>} Flattened modules
 */
const getModules = async (basePath, targetFolder = null) => {
    const object = await getObjectModules(basePath, targetFolder);
    
    return Object.values(object)
        .flatMap(event => 
            event.map(ev => ev[Object.keys(ev)[0]])
        );
};

export { 
    getObjectModules, 
    organizeFilesByMainFolders, 
    getFilesRecursively, 
    getModules,
    config, areCommandsDifferent, getApplicationCommands, membersId
};

