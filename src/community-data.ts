import type {BiomeId} from './store';
// Public game assets only. This type intentionally has no observation, location,
// photograph, consent, contributor or research-submission fields.
export type CommunityWorld={id:string;username:string;name:string;biome:BiomeId;characters:{id:number;stage:number}[];description:string;appreciations:number;demoOnly:true};
export const communityWorlds:CommunityWorld[]=[
 {id:'blooming-meadow',username:'MossyMilo',name:'The Blooming Meadow',biome:'meadow',characters:[{id:3,stage:2},{id:2,stage:3}],description:'Golden flower paths, tiny wings and a perfectly unhurried afternoon. A fictional opt-in public-world example.',appreciations:28,demoOnly:true},
 {id:'whisperwood',username:'FernFable',name:'Whisperwood',biome:'woodland',characters:[{id:0,stage:2},{id:1,stage:2},{id:4,stage:1}],description:'A woodland clearing for curious little canopy keepers. Only fictional characters and decorations are shared.',appreciations:42,demoOnly:true},
 {id:'misty-grove',username:'CloudPetal',name:'Misty Grove',biome:'wetland',characters:[{id:5,stage:3},{id:2,stage:2}],description:'Soft water, smooth stones and a little green daydream. A curated fictional world, with no real observation data.',appreciations:19,demoOnly:true}
];
