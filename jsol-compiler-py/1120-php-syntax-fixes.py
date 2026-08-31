import math
import functools
from jsol_core import JSOL

# @JSOL v0.2.97 - PHP Syntax Fixes (Isolated String Manipulations)
def saPhp_StripDeclarations(saCode): 

  saRes = saCode;
  aPrefixes = ["\n", "\r\n", "\t", " ", "("];
  iP = 0;
  while iP < 5: 

    saRes = saRes.replace( aPrefixes[iP] + "const ",  aPrefixes[iP]);
    saRes = saRes.replace( aPrefixes[iP] + "let ",  aPrefixes[iP]);
    saRes = saRes.replace( aPrefixes[iP] + "var ",  aPrefixes[iP]);

    iP = iP + 1;


  if JSOL.str_index_of(saRes,  "const ") == 0: 

    saRes = saRes[( 6):( 6)+( len(saRes) - 6)];


  if JSOL.str_index_of(saRes,  "let ") == 0: 

    saRes = saRes[( 4):( 4)+( len(saRes) - 4)];


  if JSOL.str_index_of(saRes,  "var ") == 0: 

    saRes = saRes[( 4):( 4)+( len(saRes) - 4)];


  return saRes;


def saPhp_FixStringConcat(saCode): 

  saRes = saCode;
  saRes = JSOL.regex_replace('(__JSOL_(TOKEN|STR|COM)_\\d+__)\\s*\\+',  '$1 .',  saRes,  'g');
  saRes = JSOL.regex_replace('\\+\\s*(__JSOL_(TOKEN|STR|COM)_\\d+__)',  '. $1',  saRes,  'g');
  saRes = JSOL.regex_replace('(\\$s[A-Za-z0-9_]*)\\s*\\+',  '$1 .',  saRes,  'g');
  saRes = JSOL.regex_replace('\\+\\s*(\\$s[A-Za-z0-9_]*)',  '. $1',  saRes,  'g');
  return saRes;


def saPhp_FixUseReferences(saCode): 

  saResult = saCode;
  bFixUse = True;
  iUseOffset = 0;

  while bFixUse == True: 

    iSearchLen = len(saResult) - iUseOffset;
    if iSearchLen <= 0: 

      bFixUse = False; continue;


    saSearchArea = saResult[( iUseOffset):( iUseOffset)+( iSearchLen)];
    iUseRel = JSOL.str_index_of(saSearchArea,  "use (");
    if iUseRel == -1: 

      bFixUse = False; continue;


    iStart = iUseOffset + iUseRel + 5;
    saTail = saResult[( iStart):( iStart)+( len(saResult) - iStart)];
    iEndRel = JSOL.str_index_of(saTail,  ")");
    iEnd = iStart + iEndRel;

    saArgs = saResult[( iStart):( iStart)+( iEnd - iStart)];
    saRefArgs = JSOL.regex_replace("\\$",  "&$",  saArgs,  "g");
    saRefArgs = JSOL.regex_replace("&&\\$",  "&$",  saRefArgs,  "g");

    saBefore = saResult[( 0):( 0)+( iStart)];
    saAfter = saResult[( iEnd):( iEnd)+( len(saResult) - iEnd)];

    saResult = saBefore + "" + saRefArgs + "" + saAfter;
    iUseOffset = iStart + len(saRefArgs) + 1;


  return saResult;


