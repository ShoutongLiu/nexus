import { exec } from "child_process";
import fs from "fs";

exec("npx lint-staged", (error, stdout, stderr) => {
  fs.writeFileSync(
    "test_output.txt",
    `ERROR:\n${error?.message}\nSTDOUT:\n${stdout}\nSTDERR:\n${stderr}`,
  );
});
