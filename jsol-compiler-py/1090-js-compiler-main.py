import math
import functools
from jsol_core import JSOL

# @JSOL v0.2.97 - JS Target Compiler (Blind Router)
def sCompileToJS(saMaskedCode, saPrefix, saSuffix, mSSOTRules): 

  saTransformed = saComp_ExpandSymbols(saMaskedCode);

  saMetaShadowRef = "";
  if ( "meta" in mSSOTRules) == True: 

    mMeta = mSSOTRules["meta"];
    if ( "templates" in mMeta) == True: 

      if ( "shadow_map_ref" in mMeta["templates"]) == True: 

        saMetaShadowRef = mMeta["templates"]["shadow_map_ref"];






  if ( "operations" in mSSOTRules) == True: 

    mOperations = mSSOTRules["operations"];
    aOpKeys = list(mOperations.keys());
    iOpCount = len(aOpKeys);

    iR = 0;
    while iR < iOpCount: 

      saId = aOpKeys[iR];
      mOp = mOperations[saId];

      saType = (mOp["type"] if ( "type" in mOp) else "call");
      saTemplate = (mOp["fallback"]["template"] if ( "fallback" in mOp) else mOp["template"]);

      if saType == "block": 

        saTransformed = fProcessBlock(saTransformed, saId, saTemplate == "unwrap");


      elif saType == "regex": 

        saTransformed = JSOL.regex_replace(mOp["search"],  saTemplate,  saTransformed,  "g");


      elif saType == "replace": 

        saTransformed = saTransformed.replace( saId,  saTemplate);


      elif saType == "call": 

        saTransformed = fProcessCall(saTransformed, saId + "(", saTemplate, saMetaShadowRef);


      elif saType == "paramtype": 

        saTransformed = fProcessParams(saTransformed);


      elif saType == "range": 

        saTransformed = fProcessRange(saTransformed);


      iR = iR + 1;




  else: 

    aRules = mSSOTRules;
    iRulesCount = len(aRules);
    iR = 0;
    while iR < iRulesCount: 

      mRule = aRules[iR];
      saType = mRule["type"];
      saId = mRule["id"];
      saTemplate = mRule["template"];

      if saType == "block": 

        saTransformed = fProcessBlock(saTransformed, saId, saTemplate == "unwrap");


      elif saType == "regex": 

        saTransformed = JSOL.regex_replace(mRule["search"],  saTemplate,  saTransformed,  "g");


      elif saType == "replace": 

        saTransformed = saTransformed.replace( saId,  saTemplate);


      elif saType == "call": 

        saTransformed = fProcessCall(saTransformed, saId + "(", saTemplate, "");


      elif saType == "paramtype": 

        saTransformed = fProcessParams(saTransformed);


      elif saType == "range": 

        saTransformed = fProcessRange(saTransformed);


      iR = iR + 1;




  return saPrefix + "" + saTransformed + "" + saSuffix;


