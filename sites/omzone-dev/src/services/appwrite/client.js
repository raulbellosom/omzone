/**
 * client.js — Appwrite SDK singleton.
 * Todas las instancias de servicios Appwrite se crean aquí una sola vez.
 * Importa solo las instancias que necesites para mantener el bundle óptimo.
 */
import { Client, Account, Databases, Functions, Storage } from 'appwrite'
import { APPWRITE_ENDPOINT, APPWRITE_PROJECT_ID } from '@/env'

const client = new Client()
  .setEndpoint(APPWRITE_ENDPOINT)
  .setProject(APPWRITE_PROJECT_ID)

export const account   = new Account(client)
export const databases = new Databases(client)
export const functions = new Functions(client)
export const storage   = new Storage(client)

export default client
