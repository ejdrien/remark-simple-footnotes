import { visit } from "unist-util-visit"

import { remove } from "unist-util-remove"

import util from "util"

export default () => tree => {
  const footnote_reference_regex = /(?<!\s)(?<=.+?)(\[\^)([^\]])(.*?)(\])/g
  const footnote_definiton_regex = /^(\[\^)(.+?)(\]:)/g
  
  let footnotes = {}

  let definitions_for_removal = []

  visit(
    tree,
    node => node.type === "paragraph",
    node => {
      for (let [index, child] of node.children.entries()) {
        let text = child.value

        if (child.type != "text") continue

        if (footnote_reference_regex.test(text)) {
          let footnote_names = text.match(footnote_reference_regex)

          for (let [jndex, footnote_name] of footnote_names.entries()) {
            footnote_name = footnote_name.slice(2, -1)
            let footnote_number = next_footnote_number()

            footnotes[footnote_name] = {
              number: footnote_number,
              value: null
            }

            node.children.splice(index + 1 + jndex, 0, {
              type: "html",
              value: `<a id="f${footnote_number}" class="footnote-reference" href="#footnote-${footnote_number}">${footnote_number}</a>`
            })
          }

          child.value = text.replace(footnote_reference_regex, "")
        } else if (footnote_definiton_regex.test(text)) {
          let footnote_name = text.match(footnote_definiton_regex)[0].slice(2, -2)
          let footnote_value = text.replace(footnote_definiton_regex, "")

          if (footnotes.hasOwnProperty(footnote_name)) {
            footnotes[footnote_name].value = footnote_value
            definitions_for_removal.push(node)
          } else {
            throw Error(`Footnote "${footnote_name}" doesn't have a reference.`)
          }
        }
      }
    }
  )

  for (let definition of definitions_for_removal) {
    remove(
      tree,
      node => util.isDeepStrictEqual(node, definition)
    )
  }

  let footnotes_nodes = []

  for (let footnote_key in footnotes) {
    let footnote = footnotes[footnote_key]

    if (!footnote["value"]) {
      throw Error(`Footnote "${footnote_key}" doesn't have a definition.`)
    }

    footnotes_nodes[footnote.number - 1] = {
      type: "paragraph",
      data: {
        hProperties: {
          id: `footnote-${footnote["number"]}`
        }
      },
      children: [
        {
          type: "link",
          url: `#f${footnote["number"]}`,
          data: {
            hProperties: {
              className: ["footnote-definition"]
            }
          },
          children: [
            {
              type: "text",
              value: footnote["number"],
            }
          ]
        },
        {
          type:  "text",
          value: footnote["value"]
        }
      ]
    }
  }

  let footnotes_section = {
    type: "parent",
    data: {
      hName: "section",
    },
    children: [
      {
        type: "heading",
        depth: 2,
        children: [
          {
            type: "text",
            value: "Poznámky",
          }
        ]
      },
      ...footnotes_nodes,
    ],
  }

  tree.children.push(footnotes_section)
}

let current_footnote_number = 0

const next_footnote_number = () => ++current_footnote_number