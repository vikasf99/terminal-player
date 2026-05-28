type AudioGraph = {
  context: AudioContext;
  source: MediaElementAudioSourceNode;
};

const graphByElement = new WeakMap<HTMLAudioElement, AudioGraph>();

export const getOrCreateAudioGraph = async (element: HTMLAudioElement): Promise<AudioGraph> => {
  const existing = graphByElement.get(element);
  if (existing) {
    if (existing.context.state === 'suspended') {
      await existing.context.resume();
    }
    return existing;
  }

  const context = new AudioContext();
  await context.resume();
  const source = context.createMediaElementSource(element);
  const graph = { context, source };
  graphByElement.set(element, graph);
  return graph;
};
