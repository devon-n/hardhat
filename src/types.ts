import { BuidlerArguments } from "./core/params/buidler-params";
import { ResolvedFile } from "./solidity/resolver";
import { SolcOptimizerConfig } from "./solidity/compiler";

export interface GanacheOptions {
  gasLimit: number;
  network_id: number;
  mnemonic?: string;
  accounts?: { balance: string; secretKey: string }[];
}

interface AutoNetworkAccount {
  privateKey: string;
  balance: string;
}

export interface AutoNetworkConfig {
  accounts: AutoNetworkAccount[];
  blockGasLimit: number;
  ganacheOptions?: GanacheOptions;
}

export interface HttpNetworkConfig {
  host: string;
  port?: number;
}

export type NetworkConfig = (AutoNetworkConfig | HttpNetworkConfig) & {
  from?: string;
  gas?: number;
  gasPrice?: number;
};

type Networks = {
  [networkName: string]: NetworkConfig;
};

export interface BuidlerConfig {
  networks: Networks;
  paths: {
    root: string;
    configFile: string;
    cache: string;
    artifacts: string;
    sources: string;
  };
  solc: {
    version: string;
    optimizer: SolcOptimizerConfig;
  };
  mocha: Mocha.MochaOptions;
}

export type TruffleEnvironmentArtifactsType = any;

export type TruffleContract = any;

export type TruffleContractInstance = any;

export interface TaskArguments {
  [argumentName: string]: any;
}

export type RunTaskFunction = (
  name: string,
  taskArguments?: TaskArguments
) => Promise<any>;

export type RunSuperFunction<ArgT extends TaskArguments> = (
  taskArguments?: ArgT
) => Promise<any>;

export interface BuidlerRuntimeEnvironment {
  Web3: any;
  pweb3: any;
  web3: any;
  config: BuidlerConfig;
  buidlerArguments: BuidlerArguments;
  artifacts: TruffleEnvironmentArtifactsType;
  run: RunTaskFunction;
  injectToGlobal: () => void;
}

export type EnvironmentExtensionFunction = (
  env: BuidlerRuntimeEnvironment,
  config: BuidlerConfig
) => void;

// TODO: This may be wrong. Maybe it should be just TaskArguments. The thing
// is that doing that won't allow us to type the task definitions with more
// specific types.
export type ActionType<ArgsT extends TaskArguments> = (
  taskArgs: ArgsT,
  env: BuidlerRuntimeEnvironment,
  runSuper: RunSuperFunction<ArgsT>
) => Promise<any>;

export type GlobalWithBuidlerRuntimeEnvironment = NodeJS.Global & {
  env: BuidlerRuntimeEnvironment;
};

export type ResolvedFilesMap = {
  [globalName: string]: ResolvedFile;
};
