export declare const migrationTemplate = "/* UP */\n\n/* DOWN */\n\n";
declare class Joon {
    static createInstance(env?: string, quiet?: boolean): Promise<Joon>;
    shouldLog: boolean;
    create(name: string): Promise<void>;
    up(): Promise<void>;
    down(count?: number): Promise<void>;
    reset(): Promise<void>;
    end(): Promise<void>;
    seed(): Promise<void>;
    log(message: string): void;
}
export default Joon;
