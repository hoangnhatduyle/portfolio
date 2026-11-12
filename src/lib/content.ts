import profileJson from '../content/profile.json';
import experienceJson from '../content/experience.json';
import projectsJson from '../content/projects.json';
import researchJson from '../content/research.json';
import skillsJson from '../content/skills.json';
import educationJson from '../content/education.json';
import testimonialsJson from '../content/testimonials.json';
import {
  collection,
  educationSchema,
  experienceSchema,
  profileSchema,
  projectSchema,
  researchSchema,
  skillTierSchema,
  testimonialSchema,
} from './schemas';

// Validated once at import time (build and tests share this path), so bad content fails the build.
export const profile = profileSchema.parse(profileJson);
export const experience = collection(experienceSchema).parse(experienceJson);
export const projects = collection(projectSchema).parse(projectsJson);
export const research = collection(researchSchema).parse(researchJson);
export const skills = collection(skillTierSchema).parse(skillsJson);
export const education = collection(educationSchema).parse(educationJson);
export const testimonials = collection(testimonialSchema).parse(testimonialsJson);
