// @JSOL v0.2.97 - Python Compiler Utilities
const $bIsWhitespaceCharTrim = function($saCh) {
  if ($saCh === " ") {
    return true;
  }
  if ($saCh === "\t") {
    return true;
  }
  if ($saCh === "\n") {
    return true;
  }
  if ($saCh === "\r") {
    return true;
  }
  return false;
};
const $saTrimWhitespace = function($saVal) {
  const $iLen = Str["len"]($saVal);
    let $iStart = 0;
    while ($iStart < $iLen && $bIsWhitespaceCharTrim(Str["sub"]($saVal,  $iStart,  1)) === true) {
    $iStart = $iStart + 1;
  }
  let $iEnd = $iLen;
    while ($iEnd > $iStart && $bIsWhitespaceCharTrim(Str["sub"]($saVal,  $iEnd - 1,  1)) === true) {
    $iEnd = $iEnd - 1;
  }
  return Str["sub"]($saVal,  $iStart,  $iEnd - $iStart);
};
const $bIsIdentChar = function($saCh) {
  if ($saCh === "_") {
    return true;
  }
  if ($saCh === "$") {
    return true;
  }
  if ($saCh >= "a" && $saCh <= "z") {
    return true;
  }
  if ($saCh >= "A" && $saCh <= "Z") {
    return true;
  }
  if ($saCh >= "0" && $saCh <= "9") {
    return true;
  }
  return false;
};
const $mReadWord = function($saCode, $iStart) {
  const $iLen = Str["len"]($saCode);
    let $i = $iStart;
    while ($i < $iLen && $bIsIdentChar(Str["sub"]($saCode,  $i,  1)) === true) {
    $i = $i + 1;
  }
  return JSOL.dict("word",  Str["sub"]($saCode,  $iStart,  $i - $iStart),  "end",  $i);
};
const $iSkipWhitespace = function($saCode, $iStart) {
  const $iLen = Str["len"]($saCode);
    let $i = $iStart;
    while ($i < $iLen) {
    const $saCh = Str["sub"]($saCode,  $i,  1);
        if ($saCh === " " || $saCh === "\t" || $saCh === "\n" || $saCh === "\r") {
      $i = $i + 1;
    }
    else {
      return $i;
    }
  }
  return $i;
};
const $mReadBalancedParens = function($saCode, $iOpenIndex) {
  const $iLen = Str["len"]($saCode);
    let $iDepth = 0;
    let $i = $iOpenIndex;
    let $iInsideStart = -1;

    while ($i < $iLen) {
    const $saCh = Str["sub"]($saCode,  $i,  1);
        if ($saCh === "(") {
      $iDepth = $iDepth + 1;
            if ($iDepth === 1) {
        $iInsideStart = $i + 1;
      }
    }
    else if ($saCh === ")") {
      $iDepth = $iDepth - 1;
            if ($iDepth === 0) {
        return JSOL.dict(
                    "inside",  Str["sub"]($saCode,  $iInsideStart,  $i - $iInsideStart), 
                    "end",  $i + 1
                );
      }
    }
    $i = $i + 1;
  }
  return JSOL.dict("inside",  "",  $iLen);
};
const $mReadBalancedBraces = function($saCode, $iOpenIndex) {
  const $iLen = Str["len"]($saCode);
    let $iDepth = 0;
    let $i = $iOpenIndex;
    let $iInsideStart = -1;
    while ($i < $iLen) {
    const $saCh = Str["sub"]($saCode,  $i,  1);
        if ($saCh === "{") {
      $iDepth = $iDepth + 1;
            if ($iDepth === 1) {
        $iInsideStart = $i + 1;
      }
    }
    else if ($saCh === "}") {
      $iDepth = $iDepth - 1;
            if ($iDepth === 0) {
        return JSOL.dict("inside",  Str["sub"]($saCode,  $iInsideStart,  $i - $iInsideStart),  "end",  $i + 1);
      }
    }
    $i = $i + 1;
  }
  return JSOL.dict("inside",  "",  $iLen);
};
