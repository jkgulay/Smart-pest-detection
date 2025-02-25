export const PEST_INFO = {
  'Green Leaf Hopper': {
    'Details': "Most common leafhoppers in rice fields. They spread the viral disease tungro. Both nymphs and adults feed by extracting plant sap.",
    'Host plant': "Rice, sugarcane, and gramineous weeds.",
    'Life Cycle': "Egg – 6-9 days, Nymph – 16-18 days, Adult – 2-3 weeks.",
    'Damage': "Yellowing of leaves, stunted growth, drying up of plant.",
    'Identification': "Yellow dwarf, yellow-orange leaf.",
    'Management': "Cultural: Synchronous planting, sanitation. Biological: Lady Beetle, Ground Beetle, Metarhizium. Chemical: Last resort."
  },
 'Brown Planthopper': {
        'Details': "Occurs only in rice fields, sucks the sap at the base of tillers, can cause Ragged Stunt virus and Grassy Stunt.",
        'Host plant': "Rice only.",
        'Life Cycle': "Egg – 5-8 days, Nymph – 13-15 days, Adult – 12-15 days.",
        'Damage': "Plants turn yellow and dry rapidly, heavy infestation creates sooty molds and hopper burn.",
        'Identification': "Crescent-shaped white eggs, white to brown nymphs, browning and drying of plants.",
        'Management': "Cultural: Synchronous planting, sanitation. Biological: Lady Beetle, Ground Beetle, Metarhizium. Chemical: Last resort."
    },
    'Rice Black Bug': {
        'Details': "Commonly found in rainfed and irrigated wetland environments, prefers poorly drained fields.",
        'Host plant': "Rice crop and weeds.",
        'Life Cycle': "Egg – 4-7 days, Nymph – 29-35 days, Adult – 3-4 weeks.",
        'Damage': "Browning of leaves, deadheart, bugburn, reduced tillering.",
        'Identification': "Check leaves for discoloration, decreased tillering, deadhearts.",
        'Management': "Cultural: Synchronous planting, sanitation. Biological: Light trap, Metarhizium. Chemical: Last resort."
    },
    'Rice Bug': {
        'Details': "Rice bug populations increase near woodlands, weedy areas, and staggered rice planting.",
        'Host plant': "Wild grasses.",
        'Life Cycle': "Egg – 4-9 days, Nymph – 17-27 days, Adult – 30-50 days.",
        'Damage': "Unfilled grains, discoloration, deformed grains.",
        'Identification': "Small or shriveled grains, erect panicles.",
        'Management': "Cultural: Synchronous planting, sanitation. Biological: Metarhizium, Beauveria. Chemical: Last resort."
    },
    'White Yellow Stemborer': {
        'Details': "A major insect pest that infests rice at all stages of growth.",
        'Host plant': "Rice, maize, millet, sorghum, sugarcane, wheat, grasses.",
        'Life Cycle': "Egg – 5-9 days, Larva – 20-36 days, Pupa – 6-11 days, Adult – 2-5 days.",
        'Damage': "Deadheart, drying of central tiller, whiteheads.",
        'Identification': "Deadhearts, tiny holes on stems, frass or fecal matter.",
        'Management': "Cultural: Synchronous planting, sanitation. Biological: Trichogramma, Lady Beetle, Spiders, Metarhizium. Chemical: Last resort."
    }
} as const;

export function usePestInfo() {
  const formatPestInfo = (pestName: string): string => {
    const info = PEST_INFO[pestName as keyof typeof PEST_INFO];
    if (!info) return '';

    return Object.entries(info)
      .map(([key, value]) => `<strong>${key}:</strong> ${value}`)
      .join('<br><br>');
  };

  return {
    formatPestInfo
  };
}
