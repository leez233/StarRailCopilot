import type {CallbackFun} from '/@/coreService';
import {PyShell} from '/@/pyshell';
import {installerArgs, installerPath} from '/@/config';
import {ALAS_RELAUNCH_ARGV} from '@common/constant/config';
import logger from '/@/logger';
export const createInstaller: CallbackFun = async (ctx, next) => {
  if (process.argv.includes(ALAS_RELAUNCH_ARGV)) {
    return next();
  }
  let installer: PyShell | null = null;
  try {
    installer = new PyShell(installerPath, installerArgs);
  } catch (err) {
    ctx.onError(err);
  }

  installer?.on('error', function (err: string) {
    if (!err) return;
    logger.error('installer.error:' + err);
    ctx.sendLaunchLog(err);
  });
  installer?.end(function (err: string) {
    if (!err) return;
    logger.info('installer.end:' + err);
    ctx.sendLaunchLog(err);
    // throw err;
  });
  installer?.on('stdout', function (message) {
    ctx.sendLaunchLog(message);
  });
  installer?.on('message', function (message) {
    ctx.sendLaunchLog(message);
  });
  installer?.on('stderr', function (message: string) {
    ctx.sendLaunchLog(message);
  });

  installer?.on('pythonError', err => {
    ctx.onError('alas pythonError :' + err);
  });

  return installer;
};
