import * as React from 'react';



const List = ({list, onRemoveItem}) =>
   (
    <ul>
        {list.map((item) =>
          (
            <Item key={item.objectID} item={item} onRemoveItem={onRemoveItem}/>
        ))}
      </ul>
  );


const Item = ({item, onRemoveItem}) =>
   {
     
    return(
      <li>
   <span>
     <a href={item.url }> {item.title}</a> 
   </span>
   <span> {item.author}</span>
   <span> {item.num_comments}</span>
   <span>{item.points}</span>
   <span>
     <button type='button' onClick={() => onRemoveItem(item)}>
       Dismiss
     </button>
   </span>
 </li>
    );   
   }
   
 

 // Creating a reuseable react component.
const InputWithLabel = ({ id, value, type = 'text', onInputChange, isFocused, children, }) => {
  
  const inputRef = React.useRef();

  React.useEffect(() => {
    if (isFocused && inputRef.current){
      inputRef.current.focus();
    }
  }, [isFocused]);
  
  return(
  <>
    <label htmlFor={id}>{children}</label>
    &nbsp;
    <input
      ref={inputRef}
      id={id}
      type={type}
      value={value}
      autoFocus={isFocused}
      onChange={onInputChange}
      />
  </>
  );
};


  // Custom Hook 'useSemiPersistentState'
const useSemiPersistentState = (key, initialState) => {
  const [value, setValue] = React.useState(
    localStorage.getItem('search') || initialState
  );

  React.useEffect(() => {
    localStorage.setItem(key, value);
  }, [value, key]);

  return [value, setValue];
};

const storiesReducer = (state, action) => {
  switch (action.type) {
    case 'STORIES_FETCH_INIT':
      return {
        ...state,
        isLoading: true,
        isError: false,
      };

    case 'STORIES_FETCH_SUCCESS':
      return {
        ...state,
        isLoading: false,
        isError: false,
        data: action.payload,
      };
    
    case 'STORIES_FETCH_FAILURE':
      return {
        ...state,
        isLoading: false,
        isError: true,
      };

    case 'REMOVE_STORY':
      return {
        ...state,
        data: state.data.filter(
          (story) => action.payload.objectID !== story.objectID
        ),
      };
  default:
    throw new Error();
  }
};

const App = () => {

  const initialStories =  [
    {
      title: 'React',
      url: 'https://reactjs.org/',
      author: 'Jordan Walker',
      num_comments: 3,
      points: 4,
      objectID: 0,
    },
    {
      title: 'Redux',
      url: 'https://redux.js.org/',
      author: 'Dan Abramov, Andrew Clark',
      num_comments: 2,
      points: 5,
      objectID: 1,
    },
  
  ];



  const [searchTerm, setSearchTerm] = useSemiPersistentState(
    'search',
    'React'
    );

  const getAsynStories = () =>
    new Promise((resolve) =>
    setTimeout( () =>
    resolve({data: {stories: initialStories}}),
    2000) );
     

  const [stories, dispatchStories] = React.useReducer(
    storiesReducer,
    { data: [], isLoading: false, isError: false } );

  React.useEffect(() => {
    dispatchStories({ type: 'STORIES_FETCH_INIT'});

    getAsynStories().then(result => {
      dispatchStories({
        type: 'STORIES_FETCH_SUCCESS',
        payload: result.data.stories,
      });
      setIsLoading(false);
    }) 
    .catch(()=> dispatchStories({ type: 'STORIES_FETCH_FAILURE'}));
  }, []);

  //to give feedback about pending request
  const [isLoading, setIsLoading] = React.useState(false);

  //to handle error
  const [isError, setIsError] = React.useState(false);
  
  const handleRemoveStory = (item) => {
    
    dispatchStories({
      type: 'REMOVE_STORY',
      payload: item,
    });
  };

  const handleSearch = (event)=>{
    setSearchTerm(event.target.value);
   
  };


  const searchedStories = stories.data.filter((story) =>
    story.title.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div>¨
      <h1>My React Journey So Far!</h1>
      <InputWithLabel
        id='search'
        value={searchTerm}
        isFocused
        onInputChange={handleSearch}
      > 
        <strong>Search:</strong>
      </InputWithLabel>
      
      <hr/>

      {stories.isError && <p>Something went wrong ...</p>}

      {stories.isLoading ? (
        <p>Loading...</p>
      ) : (
        <List list={searchedStories} onRemoveItem={handleRemoveStory}/>
      )}

    </div>
  );
}

export default App;
