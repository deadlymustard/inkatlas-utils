import { app, core } from "photoshop";
import { storage } from "uxp";

import { showAlert } from "./utils";

export { executeExport };

async function executeExport(file, scaleFactor, flipImage = false) {
  const fs = storage.localFileSystem;
  const saveFile = await fs.createSessionToken(file);
  const activeDoc = app.activeDocument;
  const background = activeDoc.layers.find(
    (layer) => layer.name === "Background"
  );

  if (!background || background.hidden) {
    showAlert(
      "Please ensure your file contains a black background that is not hidden."
    );
  }
  const batchPlayAction = [
    {
      _obj: "hide",
      null: [
        {
          _name: "Background",
          _ref: "layer",
        },
      ],
    },
    {
      _obj: "selectAllLayers",
      _target: [
        {
          _enum: "ordinal",
          _ref: "layer",
        },
      ],
    },
    {
      _obj: "mergeVisible",
    },
    {
      _obj: "imageSize",
      constrainProportions: true,
      interfaceIconFrameDimmed: {
        _enum: "interpolationType",
        _value: "automaticInterpolation",
      },
      scaleStyles: true,
      width: {
        _unit: "percentUnit",
        _value: scaleFactor,
      },
    },
    {
      _obj: "set",
      _target: [
        {
          _property: "selection",
          _ref: "channel",
        },
      ],
      to: {
        _enum: "channel",
        _ref: "channel",
        _value: "transparencyEnum",
      },
    },
    {
      _obj: "duplicate",
      _target: [
        {
          _property: "selection",
          _ref: "channel",
        },
      ],
    },
    {
      _obj: "show",
      null: [
        {
          _name: "Background",
          _ref: "layer",
        },
      ],
    },
    {
      _obj: "save",
      as: {
        _obj: "targaFormat",
        bitDepth: 32,
        compression: 0,
      },
      copy: true,
      documentID: app.activeDocument.id,
      in: {
        _kind: "local",
        _path: saveFile,
      },
      lowerCase: true,
    },
    {
      _obj: "show",
      null: [
        {
          _name: "Background",
          _ref: "layer",
        },
      ],
    },
  ];
  if (flipImage) {
    const flipAction = {
      _obj: "flip",
      _target: [
        {
          _enum: "ordinal",
          _ref: "document",
          _value: "first",
        },
      ],
      axis: {
        _enum: "orientation",
        _value: "vertical",
      },
    };
    let idx = batchPlayAction.findIndex(({ _obj }) => _obj == "imageSize");
    batchPlayAction.splice(idx + 1, 0, flipAction);
  }

  await core.executeAsModal(
    async (executionContext) => {
      try {
        const hostControl = executionContext.hostControl;
        const suspensionID = await hostControl.suspendHistory({
          documentID: app.activeDocument.id,
          name: "Export TGA",
        });
        await app.batchPlay(batchPlayAction);
        await hostControl.resumeHistory(suspensionID, false);
      } catch (e) {
        console.log(e);
        showAlert(`Error occured while exporting: ${e.message}`);
      }
    },
    { commandName: "Export as TGA" }
  );
}
