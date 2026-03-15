/**
 * client.js — Appwrite SDK singleton.
 * All Appwrite service instances are created once and exported from here.
 * Import only the instances you need to keep bundle size optimal.
 */
import { Client, Account, Databases, Functions, Storage } from 'appwrite'

const client = new Client()
  .setEndpoint(import.meta.env.VITE_APPWRITE_ENDPOINT)
  .setProject(import.meta.env.VITE_APPWRITE_PROJECT_ID)

export const account   = new Account(client)
export const databases = new Databases(client)
export const functions = new Functions(client)
export const storage   = new Storage(client)

export default client
