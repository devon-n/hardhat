import { run } from "../injected-env";
import { task, internalTask } from "../config-dsl";
import { BuidlerError, ERRORS } from "../core/errors";

internalTask("builtin:setup-run-environment", async () => {
  // this task is only here in case someone wants to override it.
});

task("run", "Runs an user-defined script after compiling the project")
  .addPositionalParam(
    "script",
    "A js file to be run within buidler's environment"
  )
  .addFlag("noCompile", "Don't compile before running this task")
  .setAction(
    async ({ script, noCompile }: { script: string; noCompile: boolean }) => {
      const fsExtra = await import("fs-extra");

      if (!(await fsExtra.pathExists(script))) {
        throw new BuidlerError(ERRORS.TASK_RUN_FILE_NOT_FOUND, script);
      }

      if (!noCompile) {
        await run("compile");
      }

      try {
        await run("builtin:setup-run-environment");
        require(await fsExtra.realpath(script));
      } catch (error) {
        throw new BuidlerError(
          ERRORS.TASK_RUN_SCRIPT_ERROR,
          error,
          script,
          error.message
        );
      }
    }
  );
