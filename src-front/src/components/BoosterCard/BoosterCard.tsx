import React, { useEffect, useRef, useState } from "react";
import styles from "./BoosterCard.module.css";

import beetrootImage from "../../assets/boosterCard/beetroot.png";
import butternutImage from "../../assets/boosterCard/butternut.png";
import carrotImage from "../../assets/boosterCard/carrot.png";
import eggplantImage from "../../assets/boosterCard/eggplant.png";
import farmerImage from "../../assets/boosterCard/farmer.png";
import soilbagImage from "../../assets/boosterCard/soilbag.png";

import emptyCardImage from "../../assets/boosterCard/empty_card.png";

import beetrootStatsImage from "../../assets/boosterCard/beetroot_stats.png";
import butternutStatsImage from "../../assets/boosterCard/butternut_stats.png";
import carrotStatsImage from "../../assets/boosterCard/carrot_stats.png";
import eggplantStatsImage from "../../assets/boosterCard/eggplant_stats.png";
import farmerStatsImage from "../../assets/boosterCard/farmer_stats.png";
import soilbagStatsImage from "../../assets/boosterCard/soilbag_stats.png";

import { API } from "../../lib/api";

interface BoosterCardProps {
  onClick: () => void;
  username: string;
}

const BoosterCard: React.FC<BoosterCardProps> = ({ username }) => {
  // Constants for image mapping
  const CARD_NAME_AND_IMAGE_MAP = {
    butternut: butternutImage,
    beetroot: beetrootImage,
    carrot: carrotImage,
    eggplant: eggplantImage,
    farmer: farmerImage,
    soilbag: soilbagImage,
  };

  const CARDS_ID_CORRESPONDANCY = useRef<Record<string, string>>({
    "1": CARD_NAME_AND_IMAGE_MAP.farmer,
    "2": CARD_NAME_AND_IMAGE_MAP.farmer,
    "3": CARD_NAME_AND_IMAGE_MAP.soilbag,
    "4": CARD_NAME_AND_IMAGE_MAP.soilbag,
    "5": CARD_NAME_AND_IMAGE_MAP.farmer,
    "6": CARD_NAME_AND_IMAGE_MAP.farmer,
    "7": CARD_NAME_AND_IMAGE_MAP.soilbag,
    "8": CARD_NAME_AND_IMAGE_MAP.soilbag,
    "9": CARD_NAME_AND_IMAGE_MAP.eggplant,
    "10": CARD_NAME_AND_IMAGE_MAP.eggplant,
    "11": CARD_NAME_AND_IMAGE_MAP.carrot,
    "12": CARD_NAME_AND_IMAGE_MAP.carrot,
    "13": CARD_NAME_AND_IMAGE_MAP.beetroot,
    "14": CARD_NAME_AND_IMAGE_MAP.beetroot,
    "15": CARD_NAME_AND_IMAGE_MAP.butternut,
    "16": CARD_NAME_AND_IMAGE_MAP.butternut,
  });

  let unequipped_cards = [];

  const unequipped_cards_map: Record<string, string> = {};

  const STATS_MAP = {
    [butternutImage]: butternutStatsImage,
    [beetrootImage]: beetrootStatsImage,
    [carrotImage]: carrotStatsImage,
    [eggplantImage]: eggplantStatsImage,
    [farmerImage]: farmerStatsImage,
    [soilbagImage]: soilbagStatsImage,
  };

  const [visibleStats, setStatsVisible] = useState<string | null>(null); // Show or Hide stats
  const [animating, setAnimating] = useState<boolean>(false); // Show and Hide stats animations
  const [unequippedCardsMap, setUnequippedCardsMap] = useState<
    Record<string, string>
  >({});
  const [boosterMap, setBoosterMap] = useState<Record<string, string>>({});

  // State to manage the current images for each card
  const initialImages = {
    booster1: emptyCardImage,
    booster2: emptyCardImage,
    booster3: emptyCardImage,
  };

  const [cardImages, setCardImages] = useState<{ [key: string]: string }>(
    initialImages,
  );

  // Manage dropdown visibility for each card
  const [dropdownVisible, setDropdownVisible] = useState<{
    [key: string]: boolean;
  }>({
    booster1: false,
    booster2: false,
    booster3: false,
  });

  // Initializing the equipped cards and amount of clicks
  useEffect(() => {
    const fonc = async () => {
      //fetching equipped cards
      const resp1 = await API.getEquippedCards(username);
      const respJson1 = await resp1.json();
      // console.log(respJson1.cards_equipped_ids);

      let i = 1;
      for (const id of respJson1.cards_equipped_ids) {
        if (i > 3) break;
        const boosterName = "booster" + i;

        setCardImages((prev) => ({
          ...prev,
          [boosterName]: CARDS_ID_CORRESPONDANCY.current[id.toString()],
        }));
        const newBoosterMap = boosterMap;
        newBoosterMap[boosterName] = id.toString();
        setBoosterMap(newBoosterMap);
        i++;
      }
    };

    if (username != null && username.length != 0) fonc();
  }, [username, boosterMap]);

  const handleImageClick = async (cardName: string) => {
    // If the clicked image is emptyCardImage, show dropdown to choose an image
    if (cardImages[cardName] === emptyCardImage) {
      const resp = await API.getUnequippedCards(username);
      const respJson = await resp.json();

      // Update unequipped_cards_map
      const newUnequippedCardsMap: Record<string, string> = {};
      respJson.cards_unequipped_ids.forEach((card_id: string) => {
        newUnequippedCardsMap[card_id] =
          CARDS_ID_CORRESPONDANCY.current[card_id];
      });
      setUnequippedCardsMap(newUnequippedCardsMap);

      unequipped_cards = respJson.cards_unequipped_ids;
      for (const card_id in unequipped_cards) {
        unequipped_cards_map[unequipped_cards[card_id]] =
          CARDS_ID_CORRESPONDANCY.current[unequipped_cards[card_id]];
      }

      setDropdownVisible((prev) => ({
        ...prev,
        [cardName]: !prev[cardName],
      }));
    } else {
      // Otherwise, toggle stats display
      toggleStatsVisibility(cardName);
    }
  };

  const toggleStatsVisibility = (cardName: string) => {
    if (visibleStats === cardName) {
      setAnimating(true);
      setTimeout(() => {
        setStatsVisible(null);
        setAnimating(false);
      }, 200); // Transition duration (0.2s)
    } else {
      setStatsVisible(cardName);
    }
  };

  // Handle image selection from dropdown
  const handleChooseImage = async (
    boosterName: string,
    imageKey: keyof typeof CARD_NAME_AND_IMAGE_MAP,
  ) => {
    const resp = await API.getUnequippedCards(username);
    const respJson = await resp.json();
    unequipped_cards = respJson.cards_unequipped_ids;
    for (const card_id in unequipped_cards) {
      unequipped_cards_map[unequipped_cards[card_id]] =
        CARDS_ID_CORRESPONDANCY.current[unequipped_cards[card_id]];
    }

    const resp2 = await API.equipCard(username, imageKey);
    // const resp2Json = await resp2.json();
    // console.log(resp2Json);

    if (!resp2.ok) {
      alert("Something went wrong when trying to equip the card.");
      return;
    }
    const newBoosterMap = boosterMap;
    newBoosterMap[boosterName] = imageKey;
    setBoosterMap(newBoosterMap);

    setCardImages((prev) => ({
      ...prev,
      [boosterName]: unequipped_cards_map[imageKey],
    }));
    setDropdownVisible((prev) => ({
      ...prev,
      [boosterName]: false,
    }));
  };

  const handleRemoveCard = async (boosterName: string) => {
    const key = boosterMap[boosterName];
    if (key == null || key == "") {
      alert("Something went wrong when trying to unequip the card.");
      return;
    }
    const resp = await API.unequipCard(username, key.toString());
    // const respJson = await resp.json();
    // console.log(respJson);

    if (!resp.ok) {
      alert("Something went wrong when trying to unequip the card.");
      return;
    }
    const newBoosterMap = boosterMap;
    newBoosterMap[boosterName] = "";
    setBoosterMap(newBoosterMap);

    setCardImages((prev) => ({
      ...prev,
      [boosterName]: emptyCardImage, // Replace the image with the empty card
    }));
  };

  return (
    <div className={styles.boosterContainer}>
      {Object.keys(cardImages).map((cardName) => (
        <div key={cardName} className={styles.boostercard}>
          <img
            src={cardImages[cardName]}
            alt={cardName}
            className={styles.boosterImage}
            onClick={() => handleImageClick(cardName)}
          />
          {cardImages[cardName] !== emptyCardImage && (
            <button
              className={styles.closeButton}
              onClick={(e) => {
                e.stopPropagation(); // Prevent triggering the card click
                handleRemoveCard(cardName);
              }}
            >
              ✖
            </button>
          )}

          {/* Dropdown menu for choosing an image */}
          {dropdownVisible[cardName] && (
            <div className={styles.dropdownMenu}>
              {Object.entries(unequippedCardsMap).map(([key, value]) => (
                <img
                  key={key}
                  src={value}
                  alt={key}
                  className={styles.dropdownImage}
                  onClick={() =>
                    handleChooseImage(
                      cardName,
                      key as keyof typeof CARD_NAME_AND_IMAGE_MAP,
                    )
                  }
                />
              ))}
            </div>
          )}
        </div>
      ))}

      {/* Stats display */}
      {Object.keys(cardImages).map((cardName) => {
        const statsImage = STATS_MAP[cardImages[cardName]];
        return (
          <div
            key={cardName}
            className={`${styles.statsContainer} ${
              visibleStats === cardName && !animating
                ? styles.show
                : animating && visibleStats === cardName
                  ? styles.hide
                  : ""
            }`}
          >
            {visibleStats === cardName && statsImage && (
              <img
                src={statsImage}
                alt={`${cardName} Stats`}
                className={styles.statsImage}
              />
            )}
          </div>
        );
      })}
    </div>
  );
};

export default BoosterCard;
