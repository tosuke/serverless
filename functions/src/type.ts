export interface Request {
  token: string
  command: string
  text: string
  response_url: string
  trigger_id: string
  user_id: string
  user_name: string
  channel_id: string
}

export interface User {
  id: string
  name: string
  real_name: string
  profile: {
    real_name: string
    display_name: string
    real_name_normalized: string
    display_name_normalized: string
    image_192: string
  }
}

export type EmojiMap = { [key: string]: string }