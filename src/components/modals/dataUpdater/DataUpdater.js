// La Société Nouvelle

// React
import React, { useState } from "react";
import { Button, Image, Modal } from "react-bootstrap";

// Object
import { Session } from "/src/Session";

import UpdateDataView from "./UpdatedDataView";

// Libraries
import { refetchData } from "./utils";

/** DataUpdater
 *    -> return object session with updated data
 * 
 */

export const DataUpdater = ({
  session, 
  loadUpdatedSession 
}) => {

  const [show, setShow] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const [updatedSession, setUpdatedSession] = useState({});
  const [isDatafetched, setIsDatafetched] = useState(false);

  const handleRefresh = async () => 
  {

    setIsLoading(true);

    const updatedSessionCopy = JSON.parse(JSON.stringify(session));

    const updatedSession = new Session(updatedSessionCopy);
    await refetchData(updatedSession);


    setUpdatedSession(updatedSession);
    setIsLoading(false);
    setIsDatafetched(true);
  };

  const handleClose = () => 
  {
    setShow(false);
    loadUpdatedSession(session);
  };

  const handleCloseUpdatedSession = () => {
    setShow(false);
    loadUpdatedSession(updatedSession);
  }

  return (
    <Modal show={show} size="md" onHide={handleClose}>
      <Modal.Header closeLabel="Fermer">
      <Modal.Title as={"h5"}>Actualisation des données...</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <Image
          src="/illus/sync.svg"
          alt=""
          className="d-block mx-auto mb-4"
          height={150}
        />
        {isDatafetched && (
          <UpdateDataView
            prevSession={session}
            updatedSession={updatedSession}
            handleCloseUpdatedSession={handleCloseUpdatedSession}
            handleClose={handleClose}
          ></UpdateDataView>
        )}

        {!isDatafetched && !isLoading && (
          <div className="text-center">
            <p className="">
              Il se pourrait que des données plus récentes soient disponibles.
              Souhaitez-vous vérifier si les données sont à jour ?
            </p>
            <Button
              className="mt-2"
              variant="secondary"
              disabled={isLoading}
              onClick={() => handleRefresh()}
            >
              Vérifier mes données
            </Button>
          </div>
        )}

        {isLoading && (
          <div className="loader-container my-4">
            <div className="dot-pulse m-auto"></div>
          </div>
        )}
      </Modal.Body>
    </Modal>
  );
}