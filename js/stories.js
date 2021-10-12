"use strict";

// This is the global list of the stories, an instance of StoryList
let storyList;

/** Get and show stories when site first loads. */

async function getAndShowStoriesOnStart() {
  storyList = await StoryList.getStories();
  $storiesLoadingMsg.remove();

  putStoriesOnPage();
}

/**
 * A render method to render HTML for an individual Story instance
 * - story: an instance of Story
 *
 * Returns the markup for the story.
 */

function generateStoryMarkup(story, showDeleteBtn = false) {
  // console.debug("generateStoryMarkup", story);

  const hostName = story.getHostName();
  const showIcon = Boolean(currentUser);
  return $(`
      <li id="${story.storyId}">
        ${showDeleteBtn ? putDeleteBtnHTML() : ''}
        ${showIcon ? putStarOnHTML(story, currentUser) : ''}
        <a href="${story.url}" target="a_blank" class="story-link">
          ${story.title}
        </a>
        <small class="story-hostname">(${hostName})</small>
        <small class="story-author">by ${story.author}</small>
        <small class="story-user">posted by ${story.username}</small>
      </li>
    `);
}

function putDeleteBtnHTML() {
  return `
    <span class='trash'>
      <i class="far fa-trash-alt"></i>
    </span>
    `
}

function putStarOnHTML(story, user) {
  const isFavorite = user.isFavorite(story);
  if(isFavorite) {
    return `
      <span class='star'>
        <i class='fas fa-star'></i>
      </span>
    `
  } else {
    return `
      <span class='star'>
        <i class='far fa-star'></i>
      </span>
    `
  }
}

/** Gets list of stories from server, generates their HTML, and puts on page. */

function putStoriesOnPage() {
  console.debug("putStoriesOnPage");

  $allStoriesList.empty();

  // loop through all of our stories and generate HTML for them
  for (let story of storyList.stories) {
    const $story = generateStoryMarkup(story);
    $allStoriesList.append($story);
  }

  $allStoriesList.show();
}

async function submitStory(event) {
  console.debug('submitStory');
  event.preventDefault();

  const author = $('#story-author').val();
  const title = $('#story-title').val();
  const url = $('#story-url').val();
  const username = currentUser.username;
  const data = {author, title, url, username};

  const story = await storyList.addStory(currentUser, data);
  const $newStory = generateStoryMarkup(story);
  $allStoriesList.prepend($newStory)
}
$submitForm.on('submit', submitStory);

function putFavoritesListOnPage() {
  console.debug('putFavoritesListOnPage');

  $favoritedStoriesList.empty();

  if(currentUser.favorites.length === 0) {
    $favoritedStoriesList.append('<h5>No Favorite Stories Added</h5>');
  }else{
    for(let story of currentUser.favorites) {
      $favoritedStoriesList.append(generateStoryMarkup(story));
    }
  }
  $favoritedStoriesList.show()
}

function putMyStoriesOnPage() {
  console.debug('putMyStoriesOnPage');

  $myStoriesList.empty();

  if(currentUser.ownStories.length === 0) {
    $myStoriesList.append('<h5>No My Stories Added</h5>')
  } else {
    for(let story of currentUser.ownStories) {
      let $story = generateStoryMarkup(story, true);
      $myStoriesList.append($story)
    }
  }
  $myStoriesList.show()
}

async function toggleRemove(event) {
  console.debug('removeStory');

  const $li = $(event.target).closest('li');
  const storyId = $li.attr('id');
  await storyList.removeStory(currentUser, storyId);
  await putMyStoriesOnPage();
}
$myStoriesList.on('click', '.trash', toggleRemove)

async function toggleFavorite(event) {
  console.debug('toggleFavorite');

  const $li = $(event.target).closest('li');
  const liId = $li.attr('id');
  const story = storyList.stories.find(val => val.storyId === liId)

  if($(event.target).hasClass('fas')) {
    await currentUser.removeFavorite(story)
    $(event.target).closest('i').toggleClass('fas far')
  }else {
    await currentUser.addFavorite(story)
    $(event.target).closest('i').toggleClass('fas far')

  }

}
$storiesList.on('click', '.star', toggleFavorite)