export declare const getCompletedMigrations: () => Promise<any[]>;
export declare const getPendingMigrations: () => Promise<string[]>;
export declare const parseMigration: (contents: string) => {
    up: string;
    down: string;
};
export declare const formatSQL: (contents: string) => string;
export declare const loadMigrationFile: (name: string) => Promise<string>;
export declare const loadMigration: (name: string) => Promise<{
    up: string;
    down: string;
}>;
export declare const migrationUp: (name: string, sql: string) => Promise<void>;
export declare const migrationDown: (name: string, sql: string) => Promise<void>;
export declare const getRecentMigrations: (limit?: number) => Promise<any[]>;
export declare const getSeedFiles: () => Promise<string[]>;
