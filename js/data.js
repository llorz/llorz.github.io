/**
 * Data loading and caching
 */

import { DATA_PATHS } from './config.js'; 


class DataLoader {
  constructor() {
    this.cache = new Map();
  }

  async fetchJSON(url) {
    if (this.cache.has(url)) {
      return this.cache.get(url);
    }

    try {
      const response = await fetch(url);
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }
      const data = await response.json();
      this.cache.set(url, data);
      return data;
    } catch (error) {
      console.error(`Error fetching ${url}:`, error);
      throw error;
    }
  }

  async loadAllData() {
    try {
      const [publications, collaborators, venues, services] = await Promise.all([
        this.fetchJSON(DATA_PATHS.publications),      // Use DATA_PATHS
        this.fetchJSON(DATA_PATHS.collaborators),
        this.fetchJSON(DATA_PATHS.venues),
        this.fetchJSON(DATA_PATHS.services).catch(() => ({ 
          committees: [], 
          reviewer: [] 
        }))
      ]);

      let researchExperience;
      try {
        const researchData = await this.fetchJSON('/_data/research-experience.json');
        researchExperience = researchData.research_experience || [];
      } catch (error) {
        console.warn('Research experience file not found or invalid, using empty array');
        researchExperience = [];
      }

      return {
        publications: publications.publications || [],
        collaborators: collaborators.collaborators || {},
        venues: venues.venues || {},
        services: services,
        researchExperience
      };
    } catch (error) {
      console.error('Error loading data files:', error);
      return {
        publications: [],
        collaborators: {},
        venues: {},
        services: { committees: [], reviewer: [] },
        researchExperience: []
      };
    }
  }
}

export const dataLoader = new DataLoader();