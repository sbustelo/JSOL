declare var JSOL: any;
declare var Rgx: any;
declare var Str: any;
declare var Arr: any;
declare var Bool: any;
declare var Cast: any;

// @JSOL v0.2.97 - PHP Syntax Fixes (Isolated String Manipulations)
const $saPhp_StripDeclarations = function($saCode: any): string {
  let $saRes: string = $saCode;
	const $aPrefixes: any[] = ["\n", "\r\n", "\t", " ", "("];
	for (let $iP = 0; $iP < 5; $iP = $iP + 1) {
    $saRes = Str["replace"]($saRes,  $aPrefixes[$iP] + "const ",  $aPrefixes[$iP]);
		$saRes = Str["replace"]($saRes,  $aPrefixes[$iP] + "let ",  $aPrefixes[$iP]);
		$saRes = Str["replace"]($saRes,  $aPrefixes[$iP] + "var ",  $aPrefixes[$iP]);
  }
  if (Str["indexOf"]($saRes,  "const ") === 0) {
    $saRes = Str["sub"]($saRes,  6,  Str["len"]($saRes) - 6);
  }
  if (Str["indexOf"]($saRes,  "let ") === 0) {
    $saRes = Str["sub"]($saRes,  4,  Str["len"]($saRes) - 4);
  }
  if (Str["indexOf"]($saRes,  "var ") === 0) {
    $saRes = Str["sub"]($saRes,  4,  Str["len"]($saRes) - 4);
  }
  return $saRes;
};
const $saPhp_FixStringConcat = function($saCode: any): string {
  let $saRes: string = $saCode;
	$saRes = Rgx.replace('(__JSOL_(TOKEN|STR|COM)_\\d+__)\\s*\\+',  '$1 .',  $saRes,  'g');
	$saRes = Rgx.replace('\\+\\s*(__JSOL_(TOKEN|STR|COM)_\\d+__)',  '. $1',  $saRes,  'g');
	$saRes = Rgx.replace('(\\$s[A-Za-z0-9_]*)\\s*\\+',  '$1 .',  $saRes,  'g');
	$saRes = Rgx.replace('\\+\\s*(\\$s[A-Za-z0-9_]*)',  '. $1',  $saRes,  'g');
	return $saRes;
};
const $saPhp_FixUseReferences = function($saCode: any): string {
  let $saResult: string = $saCode;
	let $bFixUse: boolean = true;
	let $iUseOffset: number = 0;

	while ($bFixUse === true) {
    const $iSearchLen: number = Str["len"]($saResult) - $iUseOffset;
		if ($iSearchLen <= 0) {
      $bFixUse = false; continue;
    }
    const $saSearchArea: string = Str["sub"]($saResult,  $iUseOffset,  $iSearchLen);
		const $iUseRel: number = Str["indexOf"]($saSearchArea,  "use (");
		if ($iUseRel === -1) {
      $bFixUse = false; continue;
    }
    const $iStart: number = $iUseOffset + $iUseRel + 5;
		const $saTail: string = Str["sub"]($saResult,  $iStart,  Str["len"]($saResult) - $iStart);
		const $iEndRel: number = Str["indexOf"]($saTail,  ")");
		const $iEnd: number = $iStart + $iEndRel;

		const $saArgs: string = Str["sub"]($saResult,  $iStart,  $iEnd - $iStart);
		let $saRefArgs: string = Rgx.replace("\\$",  "&$",  $saArgs,  "g");
		$saRefArgs = Rgx.replace("&&\\$",  "&$",  $saRefArgs,  "g");

		const $saBefore: string = Str["sub"]($saResult,  0,  $iStart);
		const $saAfter: string = Str["sub"]($saResult,  $iEnd,  Str["len"]($saResult) - $iEnd);

		$saResult = $saBefore + "" + $saRefArgs + "" + $saAfter;
		$iUseOffset = $iStart + Str["len"]($saRefArgs) + 1;
  }
  return $saResult;
};
