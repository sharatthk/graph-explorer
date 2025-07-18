import {
  createRandomEdgeTypeConfig,
  createRandomRawConfiguration,
  createRandomSchema,
  createRandomVertexTypeConfig,
  DbState,
  JotaiSnapshot,
  renderHookWithJotai,
  renderHookWithState,
} from "@/utils/testing";
import {
  activeConfigurationAtom,
  configurationAtom,
  defaultEdgeTypeConfig,
  getDefaultVertexTypeConfig,
} from "./configuration";
import { schemaAtom } from "./schema";
import { Schema } from "../ConfigurationProvider";
import {
  useDisplayEdgeTypeConfig,
  useDisplayVertexTypeConfig,
} from "./displayTypeConfigs";
import { createRandomName } from "@shared/utils/testing";
import { MISSING_DISPLAY_TYPE, RESERVED_TYPES_PROPERTY } from "@/utils";

describe("useDisplayVertexTypeConfig", () => {
  describe("when the vertex type is not in the schema", () => {
    const vtConfig = createRandomVertexTypeConfig();
    const defaultConfig = getDefaultVertexTypeConfig(vtConfig.type);

    it("should have the same type as the input", () => {
      expect(act(vtConfig.type).type).toBe(vtConfig.type);
    });

    it("should have display label match the type transformed", () => {
      expect(act(vtConfig.type).displayLabel).toBe(vtConfig.type);
    });

    it("should use empty label constant when the type is empty", () => {
      expect(act("").displayLabel).toBe(MISSING_DISPLAY_TYPE);
    });

    it("should have display name attribute from the default config", () => {
      expect(act(vtConfig.type).displayNameAttribute).toBe(
        defaultConfig.displayNameAttribute
      );
    });

    it("should have display description attribute from the default config", () => {
      expect(act(vtConfig.type).displayDescriptionAttribute).toBe(
        defaultConfig.longDisplayNameAttribute
      );
    });

    it("should have style matching the default config", () => {
      expect(act(vtConfig.type).style).toEqual({
        color: defaultConfig.color,
        iconImageType: defaultConfig.iconImageType,
        iconUrl: defaultConfig.iconUrl,
      });
    });
  });

  it("should ignore display label from schema", () => {
    const dbState = new DbState();
    const vtConfig = createRandomVertexTypeConfig();
    vtConfig.displayLabel = createRandomName("displayLabel");
    dbState.activeSchema.vertices.push(vtConfig);

    const { result } = renderHookWithState(
      () => useDisplayVertexTypeConfig(vtConfig.type),
      dbState
    );

    expect(result.current.displayLabel).toBe(vtConfig.type);
  });

  it("should use display label from user preferences", () => {
    const dbState = new DbState();
    const vtConfig = createRandomVertexTypeConfig();
    vtConfig.displayLabel = createRandomName("displayLabel");
    dbState.activeSchema.vertices.push(vtConfig);
    dbState.activeStyling.vertices?.push(vtConfig);

    const { result } = renderHookWithState(
      () => useDisplayVertexTypeConfig(vtConfig.type),
      dbState
    );

    expect(result.current.displayLabel).toBe(vtConfig.displayLabel);
  });

  it("should have display name attribute from the config", () => {
    const vtConfig = createRandomVertexTypeConfig();
    vtConfig.displayNameAttribute = createRandomName("displayNameAttribute");
    const schema = createRandomSchema();
    schema.vertices.push(vtConfig);

    expect(act(vtConfig.type, schema).displayNameAttribute).toBe(
      vtConfig.displayNameAttribute
    );
  });

  it("should have display description attribute from the config", () => {
    const vtConfig = createRandomVertexTypeConfig();
    vtConfig.longDisplayNameAttribute = createRandomName(
      "longDisplayNameAttribute"
    );
    const schema = createRandomSchema();
    schema.vertices.push(vtConfig);

    expect(act(vtConfig.type, schema).displayDescriptionAttribute).toBe(
      vtConfig.longDisplayNameAttribute
    );
  });

  it("should have style matching the config", () => {
    const vtConfig = createRandomVertexTypeConfig();
    const schema = createRandomSchema();
    schema.vertices.push(vtConfig);

    const displayConfig = act(vtConfig.type, schema);
    expect(displayConfig.style.color).toBe(vtConfig.color);
    expect(displayConfig.style.iconImageType).toBe(vtConfig.iconImageType);
    expect(displayConfig.style.iconUrl).toBe(vtConfig.iconUrl);
  });

  // Helpers

  function act(vertexConfigType: string, schema?: Schema) {
    const { result } = renderHookWithJotai(
      () => useDisplayVertexTypeConfig(vertexConfigType),
      schema ? withSchema(schema) : undefined
    );
    return result.current;
  }

  function withSchema(schema: Schema) {
    const config = createRandomRawConfiguration();
    return (snapshot: JotaiSnapshot) => {
      snapshot.set(configurationAtom, new Map([[config.id, config]]));
      snapshot.set(schemaAtom, new Map([[config.id, schema]]));
      snapshot.set(activeConfigurationAtom, config.id);
    };
  }
});

describe("useDisplayEdgeTypeConfig", () => {
  it("should have the same type as the input", () => {
    const type = createRandomName("type");
    expect(act(type).type).toBe(type);
  });

  it("should have display label match the type", () => {
    const type = createRandomName("type");
    expect(act(type).displayLabel).toBe(type);
  });

  it("should use empty label constant when the type is empty", () => {
    expect(act("").displayLabel).toBe(MISSING_DISPLAY_TYPE);
  });

  it("should have display name attribute for types", () => {
    const type = createRandomName("type");
    expect(act(type).displayNameAttribute).toBe(RESERVED_TYPES_PROPERTY);
  });

  it("should have style matching the default config", () => {
    const type = createRandomName("type");

    expect(act(type).style.sourceArrowStyle).toBe(
      defaultEdgeTypeConfig.sourceArrowStyle
    );
    expect(act(type).style.targetArrowStyle).toBe(
      defaultEdgeTypeConfig.targetArrowStyle
    );
    expect(act(type).style.lineColor).toBe(defaultEdgeTypeConfig.lineColor);
    expect(act(type).style.lineStyle).toBe(defaultEdgeTypeConfig.lineStyle);
  });

  it("should ignore display label from the config", () => {
    const dbState = new DbState();
    const etConfig = createRandomEdgeTypeConfig();
    etConfig.displayLabel = createRandomName("displayLabel");
    dbState.activeSchema.edges.push(etConfig);

    const { result } = renderHookWithState(
      () => useDisplayEdgeTypeConfig(etConfig.type),
      dbState
    );

    expect(result.current.displayLabel).toBe(etConfig.type);
  });

  it("should use display label from the user preferences", () => {
    const dbState = new DbState();
    const etConfig = createRandomEdgeTypeConfig();
    etConfig.displayLabel = createRandomName("displayLabel");
    dbState.activeSchema.edges.push(etConfig);
    dbState.activeStyling.edges?.push(etConfig);

    const { result } = renderHookWithState(
      () => useDisplayEdgeTypeConfig(etConfig.type),
      dbState
    );

    expect(result.current.displayLabel).toBe(etConfig.displayLabel);
  });

  it("should have style matching the config", () => {
    const etConfig = createRandomEdgeTypeConfig();
    const schema = createRandomSchema();
    schema.edges.push(etConfig);

    const displayConfig = act(etConfig.type, schema);
    expect(displayConfig.style.sourceArrowStyle).toBe(
      etConfig.sourceArrowStyle
    );
    expect(displayConfig.style.targetArrowStyle).toBe(
      etConfig.targetArrowStyle
    );
    expect(displayConfig.style.lineColor).toBe(etConfig.lineColor);
    expect(displayConfig.style.lineStyle).toBe(etConfig.lineStyle);
  });

  // Helpers

  function act(edgeConfigType: string, schema?: Schema) {
    const { result } = renderHookWithJotai(
      () => useDisplayEdgeTypeConfig(edgeConfigType),
      schema ? withSchema(schema) : undefined
    );
    return result.current;
  }

  function withSchema(schema: Schema) {
    const config = createRandomRawConfiguration();
    return (snapshot: JotaiSnapshot) => {
      snapshot.set(configurationAtom, new Map([[config.id, config]]));
      snapshot.set(schemaAtom, new Map([[config.id, schema]]));
      snapshot.set(activeConfigurationAtom, config.id);
    };
  }
});
