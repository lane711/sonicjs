import { describe, it, expect } from 'vitest';
import { apiConfig, config, sonicJsConfig } from './routes';


describe('API Config Tests', () => {
  it('Should API Config be defined', () => {
    expect(apiConfig).toBeDefined();
  });

  it('Should API Config be an array', () => {
    expect(Array.isArray(apiConfig)).toBe(true);
  });

  it('Should API Config have correct structure', () => {
    apiConfig.forEach(config => {
      expect(config).toHaveProperty('table');
      expect(config).toHaveProperty('definition');
      expect(config).toHaveProperty('route');
      expect(config).toHaveProperty('name');
      expect(config).toHaveProperty('icon');
    });
  });

  it('Should config be defined', () => {
    expect(config).toBeDefined();
  });

  it('Should sonicJsConfig be defined', () => {
    expect(sonicJsConfig).toBeDefined();
  });

  it('Should config and sonicJsConfig have the same apiConfig', () => {
    expect(config.apiConfig).toBe(apiConfig);
    expect(sonicJsConfig.apiConfig).toBe(apiConfig);
  });

  it('Should config and sonicJsConfig have adminAccessControl', () => {
    expect(config.adminAccessControl).toBeDefined();
    expect(sonicJsConfig.adminAccessControl).toBeDefined();
  });
});