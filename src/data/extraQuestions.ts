import type { ExampleQuestion } from "./catalog";
import { VC_MAIN_IDEA_EXTRA } from "./extraBanks/vcMainIdea";
import { VC_BLANK_EXTRA } from "./extraBanks/vcBlank";
import { VC_INSERTION_EXTRA } from "./extraBanks/vcInsertion";
import { VC_CONTENT_MATCH_EXTRA } from "./extraBanks/vcContentMatch";
import { VC_PARAGRAPH_ORDER_EXTRA } from "./extraBanks/vcParagraphOrder";
import { VC_INFERENCE_EXTRA } from "./extraBanks/vcInference";
import { VC_CRITIQUE_EXTRA } from "./extraBanks/vcCritique";
import { DA_READING_EXTRA } from "./extraBanks/daReading";
import { DA_CALC_EXTRA } from "./extraBanks/daCalc";
import { CM_CONCENTRATION_EXTRA } from "./extraBanks/cmConcentration";
import { CM_ARITHMETIC_EXTRA } from "./extraBanks/cmArithmetic";
import { CM_COST_EXTRA } from "./extraBanks/cmCost";
import { CM_PROBABILITY_EXTRA } from "./extraBanks/cmProbability";
import { CM_DISTANCE_EXTRA } from "./extraBanks/cmDistance";
import { CM_WORK_EXTRA } from "./extraBanks/cmWork";
import { VR_PROPOSITION_EXTRA } from "./extraBanks/vrProposition";
import { VR_CONDITION_EXTRA } from "./extraBanks/vrCondition";
import { VR_TRUTH_EXTRA } from "./extraBanks/vrTruth";
import { SR_GEOMETRIC_EXTRA } from "./extraBanks/srGeometric";
import { SR_VARIOUS_EXTRA } from "./extraBanks/srVarious";
import { SR_SPECIAL_EXTRA } from "./extraBanks/srSpecial";

/**
 * 문제 세트와 랜덤 문제에만 출제하는 추가 문항입니다.
 * 세부 유형 화면의 예시문제는 EXAMPLE_QUESTION_BANK만 쓰므로 여기 문항은 나오지 않습니다.
 */
export const EXTRA_QUESTION_BANK: ExampleQuestion[] = [
  ...VC_MAIN_IDEA_EXTRA,
  ...VC_BLANK_EXTRA,
  ...VC_INSERTION_EXTRA,
  ...VC_CONTENT_MATCH_EXTRA,
  ...VC_PARAGRAPH_ORDER_EXTRA,
  ...VC_INFERENCE_EXTRA,
  ...VC_CRITIQUE_EXTRA,
  ...DA_READING_EXTRA,
  ...DA_CALC_EXTRA,
  ...CM_CONCENTRATION_EXTRA,
  ...CM_ARITHMETIC_EXTRA,
  ...CM_COST_EXTRA,
  ...CM_PROBABILITY_EXTRA,
  ...CM_DISTANCE_EXTRA,
  ...CM_WORK_EXTRA,
  ...VR_PROPOSITION_EXTRA,
  ...VR_CONDITION_EXTRA,
  ...VR_TRUTH_EXTRA,
  ...SR_GEOMETRIC_EXTRA,
  ...SR_VARIOUS_EXTRA,
  ...SR_SPECIAL_EXTRA,
];
