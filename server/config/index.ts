export * from './app-data-source';

const isProdEnv = (process.env.NODE_ENV as string) === 'PROD';
export { isProdEnv };
