import React, { useState, useEffect } from "react";
import axios from "axios";
import ErrorList from "./ErrorList";
import "./App.css";
import "./styles/Dictionary.css";

function SuggestionsDropdown({ suggestions, onSelect }) {
  if (suggestions.length === 0) {
    return null;
  }

  return (
    <div className="suggestions-dropdown">
      {suggestions.map((word, index) => (
        <div
          key={index}
          className="suggestion-item"
          onClick={() => onSelect(word)}
        >
          {word}
        </div>
      ))}
    </div>
  );
}

function App() {
  const [inputValue, setInputValue] = useState("");
  const [suggestions, setSuggestions] = useState([]);
  const [selectedWord, setSelectedWord] = useState(null);
  const [wordDefinitions, setWordDefinitions] = useState([]);
  const [errors, setErrors] = useState([]);

  useEffect(() => {
    if (inputValue.trim() === "") {
      setSuggestions([]);
      return;
    }

    axios
      .get(
        `https://raw.githubusercontent.com/dwyl/english-words/master/words_alpha.txt`
      )
      .then((response) => {
        const words = response.data.split("\n");
        const filteredSuggestions = words
          .filter((word) => word.startsWith(inputValue.toLowerCase()))
          .slice(0, 5);
        setSuggestions(filteredSuggestions);
      })
      .catch((error) => console.error(error));
  }, [inputValue]);

  const handleInputChange = (e) => {
    const newInputValue = e.target.value;
    setInputValue(newInputValue);
    setSelectedWord(null);
    setSuggestions([]); // Clear suggestions when input changes
    setWordDefinitions([]); // Clear definitions when input changes
  };

  const handleSelectWord = (word) => {
    setSelectedWord(word);
    setSuggestions([]); // Clear suggestions when a word is selected
    setWordDefinitions([]); // Clear definitions when a word is selected

    // Fetch the definition of the selected word
    axios
      .get(`https://api.dictionaryapi.dev/api/v2/entries/en/${word}`)
      .then((response) => {
        const definition = response.data[0]; // Take the first definition
        setWordDefinitions([definition]);
      })
      .catch((error) => console.error(error));
  };

  const handleKeyDown = async (e) => {
    if (e.key === "Enter" && inputValue.trim() !== "") {
      // Fetch definitions for suggestions with a delay
      const fetchDefinitionsForSuggestions = async () => {
        const suggestionsWithDefinitions = [];
        const newErrors = [];

        for (const word of suggestions) {
          try {
            const response = await axios.get(
              `https://api.dictionaryapi.dev/api/v2/entries/en/${word}`
            );

            if (Array.isArray(response.data) && response.data.length > 0) {
              const definition = response.data[0]; // Take the first definition
              setWordDefinitions((prevDefinitions) => [
                ...prevDefinitions,
                definition,
              ]);
              // Add word to suggestionsWithDefinitions
              suggestionsWithDefinitions.push(word);
            } else {
              console.log(`No definitions found for the word: ${word}`);
              newErrors.push(`No definitions found for the word: ${word}`);
            }
          } catch (error) {
            console.error(error);

            if (error.response && error.response.status === 404) {
              newErrors.push(`No definitions found for the word: ${word}`);
            } else {
              newErrors.push(
                `Error fetching definitions for the word: ${word}`
              );
            }
          }

          // Introduce a delay between requests (adjust as needed)
          await new Promise((resolve) => setTimeout(resolve, 100));
        }
        // Set suggestions after fetching all definitions
        setSuggestions(suggestionsWithDefinitions.slice(0, 5));
        // Set errors
        setErrors(newErrors);
      };

      // Call the function to fetch definitions for suggestions
      fetchDefinitionsForSuggestions();
    } else {
      // Clear errors when input is empty
      setErrors([]);
    }
  };

  return (
    <>
      <div className="App">
        <div className="container">
          <header className="App-header">
            <h1 className="heading">Dictionary</h1>
          </header>
          <div className="Dictionary">
            <section>
              <div className="subheading">What word piques your interest?</div>
              <input
                className="search"
                type="text"
                value={inputValue}
                onChange={handleInputChange}
                onKeyDown={handleKeyDown}
                placeholder="Type to search..."
              />
              <SuggestionsDropdown
                className="suggest"
                suggestions={suggestions}
                onSelect={handleSelectWord}
              />

              {selectedWord && <p>Selected word: {selectedWord}</p>}
              {wordDefinitions.length > 0 && (
                <div>
                  <h2>Definitions:</h2>
                  {wordDefinitions.map((entry, index) => (
                    <div key={index}>
                      <h3>{entry.word}</h3>
                      {entry.meanings.map((meaning, i) => (
                        <div key={i}>
                          <p>{meaning.definitions[0].definition}</p>
                        </div>
                      ))}
                    </div>
                  ))}
                </div>
              )}
              {selectedWord && wordDefinitions.length === 0 && (
                <div>No definitions found for {selectedWord}</div>
              )}
              {inputValue.trim() !== "" && <ErrorList errors={errors} />}
            </section>
          </div>
        </div>
      </div>
    </>
  );
}

export default App;
/*Error Code: 500121
Request Id: 3194520e-79e7-4cc9-94fc-c604b4627f00
Correlation Id: e607de72-a149-4503-bc5b-de9287cb26ce
Timestamp: 2024-01-31T19:16:30Z */
