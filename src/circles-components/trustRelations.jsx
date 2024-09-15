import React, { useEffect } from 'react';

const TrustRelations = ({ avatarInfo, setTrustedCircles, setTrustRelations }) => {
  
    useEffect(() => {
      const trustRelationsHandle = async () => {
        try {
          const trustRelations = await avatarInfo.getTrustRelations("");
          console.log("Trust Relations:", trustRelations);
  
          const trustedCircles = trustRelations.map(rel => rel.objectAvatar);
          const mappedRelations = trustRelations.map(rel => ({
            timestamp: rel.timestamp,
            objectAvatar: rel.objectAvatar,
            relations: rel.relation
          }));
  
          setTrustedCircles(trustedCircles);
          setTrustRelations(mappedRelations);
  
          console.log(mappedRelations, "got mapped data");
        } catch (error) {
          console.error("Error processing trust relations:", error);
        }
      };
  
      if (avatarInfo) {
        trustRelationsHandle(); // Call the function here
      }
    }, [avatarInfo, setTrustedCircles, setTrustRelations]);
  
    return null; 
  };
  
  export default TrustRelations;
