// La Société Nouvelle

import React, { useState } from "react";
import Select from "react-select";
import { Col, Form, InputGroup, Row } from "react-bootstrap";
import { roundValue, valueOrDefault } from "../../../../src/utils/Utils";
import { unitSelectStyles } from "../../../../config/customStyles";

/* ---------- DECLARATION - INDIC #WAS ---------- */

const StatementWAS = ({ impactsData, onUpdate, onError }) => {
  const [wasteProduction, setWasteProduction] = useState(
    valueOrDefault(impactsData.wasteProduction, "")
  );
  const [wasteProductionUncertainty, setWasteProductionUncertainty] = useState(
    valueOrDefault(impactsData.wasteProductionUncertainty, "")
  );

  const [wasteProductionUnit, setWasteProductionUnit] = useState(
    impactsData.wasteProductionUnit
  );

  const [isInvalid, setIsInvalid] = useState(false);

  const [info, setInfo] = useState(impactsData.comments.was || "");

  const options = [
    { value: "kg", label: "kg" },
    { value: "t", label: "t" },
  ];

  const updateWasteProduction = (input) => {
    let errorMessage = "";

    const inputValue = input.target.valueAsNumber;

    if (isNaN(inputValue)) {
      errorMessage = "Veuillez saisir un nombre valide.";
    }
    if (impactsData.netValueAdded == null) {
      errorMessage = "La valeur ajoutée nette n'est pas définie.";
    }
    setIsInvalid(errorMessage !== "");
    onError("was", errorMessage);

    impactsData.setWasteProduction(input.target.value);
    setWasteProduction(input.target.value);
    setWasteProductionUncertainty(impactsData.wasteProductionUncertainty);
    onUpdate("was");
  };

  const updateWasteProductionUncertainty = (input) => {
    impactsData.wasteProductionUncertainty = input.target.value;
    setWasteProductionUncertainty(input.target.value);
    onUpdate("was");
  };

  const updateWasteProductionUnit = (selected) => {
    const selectedUnit = selected.value;

    if (selectedUnit !== impactsData.wasteProductionUnit) {
      let updatedWasteProduction = impactsData.wasteProduction;

      if (selectedUnit === "t") {
        updatedWasteProduction = impactsData.wasteProduction / 1000;
      } else if (selectedUnit === "kg") {
        updatedWasteProduction = impactsData.wasteProduction * 1000;
      }

      setWasteProduction(updatedWasteProduction);
      impactsData.setWasteProduction(updatedWasteProduction);
    }

    setWasteProductionUnit(selectedUnit);

    impactsData.wasteProductionUnit = selectedUnit;
    onUpdate("was");
  };

  const updateInfo = (event) => {
    setInfo(event.target.value);
    impactsData.comments.was = event.target.value;
  };

  return (
    <Form className="statement">
      <Row>
        <Col lg={7}>
          <Form.Group as={Row} className="form-group">
            <Form.Label column lg={7}>
              Productiont totale de déchets (y compris DAOM<sup>1</sup>)
              <p className="small mb-0 mt-1">
                <sup>1</sup> Déchets assimilés aux ordures ménagères
              </p>
            </Form.Label>
            <Col>
              <div className="custom-input with-select input-group me-1">
                <Form.Control
                  type="number"
                  value={roundValue(wasteProduction, 0)}
                  inputMode="numeric"
                  onChange={updateWasteProduction}
                  isInvalid={isInvalid}
                  className="me-1"
                />

                <Select
                  options={options}
                  styles={unitSelectStyles}
                  value={{
                    label: wasteProductionUnit,
                    value: wasteProductionUnit,
                  }}
                  onChange={updateWasteProductionUnit}
                />
              </div>
            </Col>
          </Form.Group>
          <Form.Group as={Row} className="form-group">
            <Form.Label column lg={7}>
              Incertitude
            </Form.Label>
            <Col>
              <InputGroup className="custom-input">
                <Form.Control
                  type="number"
                  value={roundValue(wasteProductionUncertainty, 0)}
                  inputMode="numeric"
                  onChange={updateWasteProductionUncertainty}
                  className="uncertainty-input"
                />
                <InputGroup.Text>%</InputGroup.Text>
              </InputGroup>
            </Col>
          </Form.Group>
        </Col>
        <Col>
          <Form.Group className="form-group">
            <Form.Label>Informations complémentaires</Form.Label>
            <Form.Control
              as="textarea"
              rows={3}
              className="w-100"
              onChange={updateInfo}
              value={info}
            />
          </Form.Group>
        </Col>
      </Row>
    </Form>
  );
};

export default StatementWAS;
