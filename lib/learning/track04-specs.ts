import type { CourseBuilderBuildDraft } from "./course-builder";
import { track04BatchADrafts } from "../../fixtures/course-builder/track04-batch-a";
import { track04BatchBDrafts } from "../../fixtures/course-builder/track04-batch-b";
import { track04BatchCDrafts } from "../../fixtures/course-builder/track04-batch-c";
import { track04BatchDDrafts } from "../../fixtures/course-builder/track04-batch-d";
import { track04BatchEDrafts } from "../../fixtures/course-builder/track04-batch-e";
export const track04LessonSpecs=[...track04BatchADrafts,...track04BatchBDrafts,...track04BatchCDrafts,...track04BatchDDrafts,...track04BatchEDrafts].map(d=>(d as CourseBuilderBuildDraft).lessonSpec);
