import math
from jsol_core import JSOL

# @JSOL v0.2.95 - Targets Configuration Normalizer
def _mNormalizeTargetsConfig(_mRawConfig): 

  _mJsConfig = JSOL.dict("default",  "",  "targets",  JSOL.dict());
  _mPhpConfig = JSOL.dict("default",  "",  "targets",  JSOL.dict());
  _mTsConfig = JSOL.dict("default",  "",  "targets",  JSOL.dict());
  _mPyConfig = JSOL.dict("default",  "",  "targets",  JSOL.dict());

  if _mRawConfig == None: 

    return JSOL.dict("js",  _mJsConfig,  "php",  _mPhpConfig,  "ts",  _mTsConfig,  "py",  _mPyConfig);


  if ( "js" in _mRawConfig): 

    _mJsConfig["default"] = _mRawConfig["js"]["default"] or "";
    _mJsConfig["targets"] = _mRawConfig["js"]["targets"] or JSOL.dict();


  if ( "php" in _mRawConfig): 

    _mPhpConfig["default"] = _mRawConfig["php"]["default"] or "";
    _mPhpConfig["targets"] = _mRawConfig["php"]["targets"] or JSOL.dict();


  if ( "ts" in _mRawConfig): 

    _mTsConfig["default"] = _mRawConfig["ts"]["default"] or "";
    _mTsConfig["targets"] = _mRawConfig["ts"]["targets"] or JSOL.dict();


  if ( "py" in _mRawConfig): 

    _mPyConfig["default"] = _mRawConfig["py"]["default"] or "";
    _mPyConfig["targets"] = _mRawConfig["py"]["targets"] or JSOL.dict();


  if ( "default" in _mRawConfig) and ( "targets" in _mRawConfig): 

    _mJsConfig["default"] = _mRawConfig["default"];
    _mPhpConfig["default"] = _mRawConfig["default"];
    _mTsConfig["default"] = _mRawConfig["default"];
    _mJsConfig["targets"] = _mRawConfig["targets"];
    _mPhpConfig["targets"] = _mRawConfig["targets"];
    _mTsConfig["targets"] = _mRawConfig["targets"];
    _mPyConfig["default"] = _mRawConfig["default"];
    _mPyConfig["targets"] = _mRawConfig["targets"];


  return JSOL.dict("js",  _mJsConfig,  "php",  _mPhpConfig,  "ts",  _mTsConfig,  "py",  _mPyConfig);


