# coding=utf-8
import os
import glob
import csv
import json

def get_words_per_topic(corpus_name, ranking_type='sal'):
    topic_dir = os.path.join("Data", "Metadata", corpus_name, "TopicModel", "topics_{}".format(ranking_type))
    num_topics = len(glob.glob(os.path.join(topic_dir, 'topic_*.csv')))

    num_of_words_per_topic = []
    words_proportion_per_topic =[]
    word_ranking_in_topics = {}
    topic_id = 0
    for topic in range(num_topics):
        with open(os.path.join(topic_dir, "topic_{}.csv".format(topic)), 'r') as topic_file:
            topic_reader = csv.reader(topic_file)
            row_count = 0
            words_proportion = []
            for row in topic_reader:
                row_count += 1
                word = row[0]
                if word not in word_ranking_in_topics:
                    word_ranking_in_topics[word] = {}
                word_ranking_in_topics[word][topic_id] = row_count
                if (row_count <= 20):
                    words_proportion.append({"word": row[0], "prop": row[1]})
            num_of_words_per_topic.append(row_count)
            words_proportion_per_topic.append(words_proportion)
        topic_id += 1

    return {"wordsPerTopic": num_of_words_per_topic, "wordRankingInTopics": word_ranking_in_topics, "wordsPropPerTopic": words_proportion_per_topic}


def write_to_json(corpus, data, ranking_type='sal'):
    filepath = os.path.join("Data", "Metadata", corpus, "TopicModel", "topics_{}".format(ranking_type), "topic_model.json")
    with open(filepath, 'w') as outfile:
        json.dump(data, outfile)

if __name__ == "__main__":
    corpus = "Shakespeare_50"
    result = get_words_per_topic(corpus)
    # print(result)
    write_to_json(corpus, result)