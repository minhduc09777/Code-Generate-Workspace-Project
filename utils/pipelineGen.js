import {flattenSections } from './utils.js';

function GenerateCodeProcessing(sections, struct, name) {
    if (!sections || sections.length === 0) {
        return null;
    }

    return [
        `${struct} ${name} = {`,
        ...flattenSections(sections, true),
        "};"
    ];
}

function GenerateConfigProcessing(sections) {

    if (sections.length === 0) {
        return null;
    }

    return [
        ...flattenSections(sections, false),
    ];
}

export function pipelineGenerate(sectionsCode, sectionConfig, structName="uint32_t", varName="dummy")
{
    const codeContent = GenerateCodeProcessing(sectionsCode, structName, varName);
    const configContent = GenerateConfigProcessing(sectionConfig);

    return {
        "code": codeContent,
        "config": configContent,
    }
}